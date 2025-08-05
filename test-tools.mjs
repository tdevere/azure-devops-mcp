#!/usr/bin/env node
// Test script to verify MCP tools are registered correctly

import { configureAllTools } from './dist/tools.js';

// Mock MCP server to capture tool registrations
const tools = [];
const mockServer = {
  tool: (name, description, schema, handler) => {
    tools.push({
      name,
      description: description.substring(0, 50) + '...',
      hasHandler: typeof handler === 'function'
    });
  }
};

// Mock providers
const mockTokenProvider = () => Promise.resolve({ token: 'mock' });
const mockConnectionProvider = () => Promise.resolve({});
const mockUserAgentProvider = () => 'test';

try {
  configureAllTools(mockServer, mockTokenProvider, mockConnectionProvider, mockUserAgentProvider);

  console.log('✅ Successfully registered', tools.length, 'tools:');
  console.log('');

  const failureReportTool = tools.find(t => t.name === 'build_generate_failure_report');
  if (failureReportTool) {
    console.log('🎉 Found build_generate_failure_report tool!');
    console.log('   Description:', failureReportTool.description);
    console.log('   Has Handler:', failureReportTool.hasHandler);
  } else {
    console.log('❌ build_generate_failure_report tool NOT found');
    console.log('Available build tools:');
    tools.filter(t => t.name.startsWith('build_')).forEach(t => {
      console.log('  -', t.name);
    });
  }

} catch (error) {
  console.error('❌ Error configuring tools:', error.message);
  console.error(error.stack);
}
