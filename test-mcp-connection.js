#!/usr/bin/env node

/**
 * Simple MCP server test - verify the server responds to tool list requests
 */

import { spawn } from 'child_process';
import { loadTestConfig } from './dist/config.js';

async function testMCPServer() {
  console.log('🧪 Testing MCP Server Connection...');

  // Load configuration
  const config = loadTestConfig();
  const orgMatch = config.azureDevOpsOrgUrl.match(/dev\.azure\.com\/([^\/]+)/);
  const orgName = orgMatch[1];

  // Prepare environment
  const env = {
    ...process.env,
    AZURE_DEVOPS_ORG_URL: config.azureDevOpsOrgUrl,
    AZURE_DEVOPS_PAT: config.azureDevOpsPat
  };

  // Start server process
  const server = spawn('node', ['dist/index.js', orgName], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Send MCP tool list request
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list"
  };

  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';

    server.stdout.on('data', (data) => {
      output += data.toString();

      // Look for JSON response
      try {
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('{')) {
            const response = JSON.parse(line.trim());
            if (response.result && response.result.tools) {
              const tools = response.result.tools;
              const failedPipelineTools = tools.filter(tool =>
                tool.name.includes('failed_builds')
              );

              console.log('✅ MCP Server is responding!');
              console.log(`📊 Total tools available: ${tools.length}`);
              console.log(`🔧 Failed pipeline analysis tools: ${failedPipelineTools.length}`);

              if (failedPipelineTools.length > 0) {
                console.log('\n🎯 Your new failed pipeline tools:');
                failedPipelineTools.forEach(tool => {
                  console.log(`   - ${tool.name}: ${tool.description}`);
                });
              }

              server.kill();
              resolve(true);
              return;
            }
          }
        }
      } catch {
        // Continue waiting for valid JSON
      }
    });

    server.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    server.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Server failed to start');
        console.error('Error output:', errorOutput);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Send the request after a brief delay
    setTimeout(() => {
      server.stdin.write(JSON.stringify(request) + '\n');
    }, 1000);

    // Timeout after 10 seconds
    setTimeout(() => {
      server.kill();
      reject(new Error('Timeout waiting for server response'));
    }, 10000);
  });
}

// Run the test
testMCPServer()
  .then(() => {
    console.log('\n🎉 MCP server test completed successfully!');
    console.log('💡 Your server is ready for VS Code integration.');
  })
  .catch((error) => {
    console.error('\n❌ MCP server test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('  1. Check that npm run build completed successfully');
    console.log('  2. Verify your .env.local configuration');
    console.log('  3. Test with ./test-failed-builds-tools.js first');
  });
