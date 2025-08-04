// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Configuration loader utility
// Loads configuration from .env.local file or environment variables

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TestConfig {
  azureDevOpsOrgUrl: string;
  azureDevOpsPat: string;
  defaultProject: string;
  maxBuildsToAnalyze: number;
  includeLogsByDefault: boolean;
  pipelineDefinitions?: number[];
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Parse a .env file content into key-value pairs
 */
function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse KEY=VALUE format
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Load configuration from .env.local file or environment variables
 */
export function loadTestConfig(): TestConfig {
  const configPath = join(__dirname, '..', '.env.local');
  const envVars: Record<string, string> = {};
  
  // Try to load from .env.local file first
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8');
      Object.assign(envVars, parseEnvFile(content));
      console.log('✅ Loaded configuration from .env.local');
    } catch (error) {
      console.warn('⚠️  Failed to read .env.local file:', error);
    }
  } else {
    console.log('ℹ️  No .env.local file found, using environment variables');
  }
  
  // Override with actual environment variables (they take precedence)
  Object.assign(envVars, process.env);
  
  // Validate required fields
  const requiredFields = ['AZURE_DEVOPS_ORG_URL', 'AZURE_DEVOPS_PAT', 'DEFAULT_PROJECT'];
  const missingFields = requiredFields.filter(field => !envVars[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration: ${missingFields.join(', ')}. Please set these in .env.local or environment variables.`);
  }
  
  // Parse and return config
  const config: TestConfig = {
    azureDevOpsOrgUrl: envVars.AZURE_DEVOPS_ORG_URL || '',
    azureDevOpsPat: envVars.AZURE_DEVOPS_PAT || '',
    defaultProject: envVars.DEFAULT_PROJECT || '',
    maxBuildsToAnalyze: parseInt(envVars.MAX_BUILDS_TO_ANALYZE || '10'),
    includeLogsByDefault: envVars.INCLUDE_LOGS_BY_DEFAULT?.toLowerCase() === 'true',
  };
  
  // Optional fields
  if (envVars.PIPELINE_DEFINITIONS) {
    config.pipelineDefinitions = envVars.PIPELINE_DEFINITIONS
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));
  }
  
  if (envVars.MIN_DATE) {
    config.minDate = new Date(envVars.MIN_DATE);
  }
  
  if (envVars.MAX_DATE) {
    config.maxDate = new Date(envVars.MAX_DATE);
  }
  
  return config;
}

/**
 * Create a configuration summary for display
 */
export function getConfigSummary(config: TestConfig): string {
  const lines = [
    `🔧 Configuration Summary:`,
    `   Organization: ${config.azureDevOpsOrgUrl}`,
    `   Default Project: ${config.defaultProject}`,
    `   Max Builds: ${config.maxBuildsToAnalyze}`,
    `   Include Logs: ${config.includeLogsByDefault}`,
  ];
  
  if (config.pipelineDefinitions) {
    lines.push(`   Pipeline Definitions: ${config.pipelineDefinitions.join(', ')}`);
  }
  
  if (config.minDate) {
    lines.push(`   Min Date: ${config.minDate.toISOString()}`);
  }
  
  if (config.maxDate) {
    lines.push(`   Max Date: ${config.maxDate.toISOString()}`);
  }
  
  return lines.join('\n');
}
