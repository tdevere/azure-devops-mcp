#!/usr/bin/env node

/**
 * MCP Server startup script for VS Code testing
 * This script starts the Azure DevOps MCP server with proper configuration
 */

import { spawn } from 'child_process';
import { loadTestConfig } from './dist/config.js';

// Load configuration
let config;
try {
  config = loadTestConfig();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  console.log('\n💡 To fix this:');
  console.log('   1. Make sure .env.local exists with your Azure DevOps details');
  console.log('   2. Run ./setup-config.js if you need to create the config');
  process.exit(1);
}

// Extract organization name from URL
const orgMatch = config.azureDevOpsOrgUrl.match(/dev\.azure\.com\/([^\/]+)/);
if (!orgMatch) {
  console.error('❌ Invalid Azure DevOps URL format. Expected: https://dev.azure.com/org-name');
  process.exit(1);
}
const orgName = orgMatch[1];

console.log('🚀 Starting Azure DevOps MCP Server...');
console.log(`📍 Organization: ${orgName}`);
console.log(`🔗 URL: ${config.azureDevOpsOrgUrl}`);
console.log(`📁 Default Project: ${config.defaultProject}`);
console.log();

// Set up environment variables
const env = {
  ...process.env,
  AZURE_DEVOPS_ORG_URL: config.azureDevOpsOrgUrl,
  AZURE_DEVOPS_PAT: config.azureDevOpsPat
};

// Start the MCP server
const server = spawn('node', ['dist/index.js', orgName], {
  env,
  stdio: 'inherit'
});

server.on('close', (code) => {
  console.log(`\n🔴 MCP Server exited with code ${code}`);
  process.exit(code);
});

server.on('error', (error) => {
  console.error('❌ Failed to start MCP server:', error);
  process.exit(1);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MCP server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down MCP server...');
  server.kill('SIGTERM');
});
