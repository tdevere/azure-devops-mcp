#!/usr/bin/env node

/**
 * Quick test script for the new failed pipeline analysis tools
 * 
 * Usage:
 * 1. Create .env.local file with your configuration (see .env.example)
 * 2. Run the script:
 *    node test-failed-builds-tools.js [project-name]
 * 
 * The project name is optional if you set DEFAULT_PROJECT in .env.local
 */

import { configureBuildTools } from './dist/tools/builds.js';
import { loadTestConfig, getConfigSummary } from './dist/config.js';
import { WebApi } from 'azure-devops-node-api';

// Load configuration
let config;
try {
  config = loadTestConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  console.log('\n💡 To fix this:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Fill in your Azure DevOps details in .env.local');
  console.log('   3. Run the script again');
  process.exit(1);
}

// Get project name from command line or config
const projectName = process.argv[2] || config.defaultProject;
if (!projectName) {
  console.error('❌ No project specified. Either:');
  console.error('   - Pass project name as argument: node test-failed-builds-tools.js "ProjectName"');
  console.error('   - Set DEFAULT_PROJECT in your .env.local file');
  process.exit(1);
}

console.log(getConfigSummary(config));
console.log(`\n🎯 Testing project: ${projectName}`);

// Mock MCP server to capture tool registrations
const mockServer = {
  tools: new Map(),
  tool(name, description, schema, handler) {
    this.tools.set(name, { name, description, schema, handler });
    console.log(`Registered tool: ${name}`);
  }
};

// Set up Azure DevOps connection
const tokenProvider = async () => ({ 
  token: config.azureDevOpsPat, 
  expiresOnTimestamp: Date.now() + 3600000 
});

const connectionProvider = async () => new WebApi(config.azureDevOpsOrgUrl, { accessToken: config.azureDevOpsPat });

// Configure the build tools
console.log('\n🔧 Configuring build tools...');
configureBuildTools(mockServer, tokenProvider, connectionProvider);

// Test function
async function runTest(toolName, params, description) {
  console.log(`\n📊 ${description}`);
  console.log(`🔧 Tool: ${toolName}`);
  console.log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`);
  console.log('⏳ Running...');
  
  const tool = mockServer.tools.get(toolName);
  if (!tool) {
    console.error(`❌ Tool ${toolName} not found`);
    return;
  }

  try {
    const result = await tool.handler(params);
    console.log('✅ Success!');
    
    // Parse the result to show summary
    const content = result.content[0].text;
    const data = JSON.parse(content);
    
    if (Array.isArray(data)) {
      console.log(`📈 Found ${data.length} results`);
      if (data.length > 0) {
        console.log(`📝 Sample result keys: ${Object.keys(data[0]).join(', ')}`);
      }
    } else if (data.failureAnalysis) {
      const definitions = Object.keys(data.failureAnalysis);
      console.log(`📈 Analyzed ${definitions.length} pipeline definitions`);
      if (data.summary) {
        console.log(`📊 Summary: ${data.summary.totalFailedBuilds} failed builds across ${data.summary.definitionsWithFailures} definitions`);
      }
    } else {
      console.log(`📄 Result type: ${typeof data}`);
    }
    
    // Option to save full results
    if (process.env.SAVE_RESULTS === 'true') {
      const fs = await import('fs');
      const filename = `${toolName}-${Date.now()}.json`;
      fs.writeFileSync(filename, content, 'utf8');
      console.log(`💾 Full results saved to: ${filename}`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (process.env.DEBUG === 'true') {
      console.error(error.stack);
    }
  }
}

// Run tests
async function runAllTests() {
  console.log('\n🚀 Starting tests...');
  
  // Test 1: Basic failed builds
  await runTest('build_get_failed_builds', {
    project: projectName,
    top: config.maxBuildsToAnalyze
  }, `Getting basic failed builds (last ${config.maxBuildsToAnalyze})`);

  // Test 2: Failed builds with partially succeeded
  await runTest('build_get_failed_builds', {
    project: projectName,
    top: Math.min(5, config.maxBuildsToAnalyze),
    includePartiallySucceeded: true,
    includeCanceled: true,
    ...(config.minDate && { minTime: config.minDate }),
    ...(config.maxDate && { maxTime: config.maxDate })
  }, 'Getting failed builds including partial successes and cancellations');

  // Test 3: Detailed failed builds (smaller number due to API calls)
  await runTest('build_get_failed_builds_detailed', {
    project: projectName,
    top: Math.min(3, config.maxBuildsToAnalyze),
    includeLogs: config.includeLogsByDefault,
    ...(config.minDate && { minTime: config.minDate }),
    ...(config.maxDate && { maxTime: config.maxDate })
  }, 'Getting detailed failed builds information');

  // Test 4: Failure analysis by definition
  const analysisParams = {
    project: projectName,
    top: Math.min(5, config.maxBuildsToAnalyze),
    includeSummary: true,
    ...(config.minDate && { minTime: config.minDate }),
    ...(config.maxDate && { maxTime: config.maxDate })
  };

  // Add specific definitions if configured
  if (config.pipelineDefinitions && config.pipelineDefinitions.length > 0) {
    analysisParams.definitions = config.pipelineDefinitions;
  }

  await runTest('build_get_failed_builds_by_definition', analysisParams, 'Analyzing failure patterns by pipeline definition');

  console.log('\n🎉 All tests completed!');
  console.log('\n💡 Tips:');
  console.log('  - Set SAVE_RESULTS=true to save full JSON results to files');
  console.log('  - Set DEBUG=true to see full error details');
  console.log('  - Adjust the "top" parameter to get more/fewer results');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
