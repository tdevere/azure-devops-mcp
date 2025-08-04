#!/usr/bin/env node

/**
 * Setup script for Azure DevOps MCP Failed Pipeline Analysis Tools
 * This script helps you create your .env.local configuration file
 */

import { writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Azure DevOps Failed Pipeline Analysis Tools - Setup');
  console.log('════════════════════════════════════════════════════════');
  console.log();

  // Check if .env.local already exists
  if (existsSync('.env.local')) {
    console.log('⚠️  .env.local already exists!');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled. Edit .env.local manually if needed.');
      rl.close();
      return;
    }
    console.log();
  }

  console.log('Please provide your Azure DevOps configuration:');
  console.log();

  // Collect configuration
  const orgUrl = await question('Azure DevOps Organization URL (e.g., https://dev.azure.com/myorg): ');
  const pat = await question('Personal Access Token (with Build read permissions): ');
  const defaultProject = await question('Default Project Name (optional): ');
  
  console.log();
  console.log('Optional settings (press Enter to use defaults):');
  
  const maxBuilds = await question('Max builds to analyze per test (default: 10): ') || '10';
  const includeLogs = await question('Include logs by default? (y/N): ');
  const pipelineIds = await question('Specific pipeline definition IDs (comma-separated, optional): ');
  
  // Create configuration content
  const config = [
    '# Private Configuration File',
    '# This file contains sensitive information and should NOT be committed to git',
    '',
    '# Azure DevOps Configuration',
    `AZURE_DEVOPS_ORG_URL=${orgUrl}`,
    `AZURE_DEVOPS_PAT=${pat}`,
    '',
    '# Test Configuration',
    defaultProject ? `DEFAULT_PROJECT=${defaultProject}` : '# DEFAULT_PROJECT=YourProjectName',
    `MAX_BUILDS_TO_ANALYZE=${maxBuilds}`,
    `INCLUDE_LOGS_BY_DEFAULT=${includeLogs.toLowerCase() === 'y' || includeLogs.toLowerCase() === 'yes'}`,
    '',
    '# Optional: Specific pipeline definitions to focus on',
    pipelineIds ? `PIPELINE_DEFINITIONS=${pipelineIds}` : '# PIPELINE_DEFINITIONS=123,456,789',
    '',
    '# Optional: Date range for analysis (ISO format)',
    '# MIN_DATE=2025-07-01T00:00:00Z',
    '# MAX_DATE=2025-08-04T23:59:59Z'
  ];

  // Write configuration file
  writeFileSync('.env.local', config.join('\n'));

  console.log();
  console.log('✅ Configuration saved to .env.local');
  console.log();
  console.log('Next steps:');
  console.log('1. Test your configuration:');
  console.log('   ./test-failed-builds-tools.js');
  console.log();
  console.log('2. Or test with a specific project:');
  console.log('   ./test-failed-builds-tools.js "YourProjectName"');
  console.log();
  console.log('💡 You can edit .env.local anytime to change these settings.');

  rl.close();
}

// Handle errors
setup().catch(error => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});
