#!/usr/bin/env node

/**
 * Start the Azure DevOps MCP server with WebSocket support for VS Code extensions
 */

import { spawn } from 'child_process';
import { loadTestConfig } from './dist/config.js';

async function startMCPServerWS() {
  console.log('🚀 Starting Azure DevOps MCP Server with WebSocket support...');

  // Load configuration
  const config = loadTestConfig();
  const orgMatch = config.azureDevOpsOrgUrl.match(/dev\.azure\.com\/([^\/]+)/);
  const orgName = orgMatch[1];

  console.log(`📋 Organization: ${orgName}`);
  console.log(`🔗 URL: ws://localhost:3000`);

  // Prepare environment
  const env = {
    ...process.env,
    AZURE_DEVOPS_ORG_URL: config.azureDevOpsOrgUrl,
    AZURE_DEVOPS_PAT: config.azureDevOpsPat,
    MCP_PORT: '3000'
  };

  // Start server process
  const server = spawn('node', ['dist/index.js', orgName, '--port', '3000'], {
    env,
    stdio: 'inherit'
  });

  server.on('close', (code) => {
    console.log(`\n📡 MCP server stopped with code ${code}`);
  });

  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MCP server...');
    server.kill();
    process.exit(0);
  });

  console.log('\n💡 Add this URL to your VS Code MCP configuration:');
  console.log('   ws://localhost:3000');
  console.log('\n🔧 Server is running. Press Ctrl+C to stop.');
}

startMCPServerWS().catch(console.error);
