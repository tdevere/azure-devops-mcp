#!/usr/bin/env node

/**
 * Test the specific request: last 5 failed builds in Project_001
 */

import { configureBuildTools } from './dist/tools/builds.js';
import { loadTestConfig } from './dist/config.js';
import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';

const config = loadTestConfig();

// Mock MCP server
const mockServer = {
  tools: new Map(),
  tool(name, description, schema, handler) {
    this.tools.set(name, { name, description, schema, handler });
  }
};

// Set up Azure DevOps connection
const tokenProvider = async () => ({
  token: config.azureDevOpsPat,
  expiresOnTimestamp: Date.now() + 3600000
});

const connectionProvider = async () => {
  const authHandler = getPersonalAccessTokenHandler(config.azureDevOpsPat);
  return new WebApi(config.azureDevOpsOrgUrl, authHandler);
};

// Configure tools
configureBuildTools(mockServer, tokenProvider, connectionProvider);

// Run the specific request
async function getLastFiveFailedBuilds() {
  console.log('🎯 Getting last 5 failed builds in project "Project_001"...\n');

  const tool = mockServer.tools.get('build_get_failed_builds');
  const result = await tool.handler({
    project: "Project_001",
    top: 5
  });

  const builds = JSON.parse(result.content[0].text);

  console.log(`📊 Found ${builds.length} failed builds:\n`);

  builds.forEach((build, index) => {
    console.log(`${index + 1}. Build #${build.buildNumber} (ID: ${build.id})`);
    console.log(`   📅 Finished: ${new Date(build.finishTime).toLocaleString()}`);
    console.log(`   🔧 Pipeline: ${build.definition.name}`);
    console.log(`   📋 Result: ${build.result} (${build.status})`);
    console.log(`   🌿 Branch: ${build.sourceBranch}`);
    console.log(`   👤 Requested by: ${build.requestedBy?.displayName || 'Unknown'}`);
    console.log(`   🔗 URL: ${build._links?.web?.href || 'N/A'}`);
    console.log('');
  });
}

getLastFiveFailedBuilds().catch(console.error);
