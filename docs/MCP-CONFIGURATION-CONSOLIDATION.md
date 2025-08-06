# MCP Server Configuration Consolidation

## Overview
Consolidated all Azure DevOps MCP server configurations into a unified, organized structure with clear separation of concerns.

## File Structure

### Core MCP Configurations
- **`mcp.json`** - Root level MCP server configuration (for NPM package distribution)
- **`.vscode/mcp.json`** - VS Code specific MCP server configuration (for local development)

### Extended Configurations  
- **`mcp-client-config.json`** - Extended client configuration with aliases and quick commands
- **`.vscode/ado-config.json`** - VS Code workspace settings with common prompts and examples

## Key Changes Made

### 1. Unified Server Naming
- Changed from multiple server names (`ado`, `azure-devops-failed-pipelines`) to consistent `azure-devops`
- Added default organization value for easier setup

### 2. Environment Variables
- Standardized on `AZURE_DEVOPS_EXT_PAT` for Personal Access Token
- Added `AZURE_DEVOPS_ORG_URL` for complete URL construction

### 3. Enhanced Configuration
- Added default values for common inputs
- Consolidated aliases and quick commands
- Included all available Azure DevOps MCP tools

### 4. Documentation Integration
- Added example commands that showcase ICM report generation
- Included failure pattern analysis commands
- Organized commands by complexity level

## Configuration Details

### MCP Server Definition
```json
{
  "servers": {
    "azure-devops": {
      "type": "stdio",
      "command": "node", 
      "args": ["./dist/index.js", "${input:ado_org}"],
      "env": {
        "AZURE_DEVOPS_EXT_PAT": "${env:AZURE_DEVOPS_PAT}",
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/${input:ado_org}"
      }
    }
  }
}
```

### Available Quick Commands
1. **List Projects** - "List my ADO projects"
2. **Failed Builds** - "Show me the last 10 failed builds in project \"Project_001\""
3. **Build Analysis** - "Generate comprehensive failure report for build #1380"
4. **ICM Report** - "Please create an ICM report for Project_001 last build failure"
5. **Pattern Analysis** - "Group failed builds by pipeline definition for \"Project_001\""

### Tool Aliases
- `projects` → `core_list_projects`
- `teams` → `core_list_project_teams`
- `builds` → `build_get_builds`
- `failed-builds` → `build_get_failed_builds`
- `failure-report` → `build_generate_failure_report`
- `detailed-failures` → `build_get_failed_builds_detailed`
- `failure-patterns` → `build_get_failed_builds_by_definition`

## Benefits of Consolidation

### For Developers
- **Single Source of Truth**: All MCP configurations in one place
- **Consistent Naming**: No confusion between different server names
- **Easy Setup**: Default values reduce configuration overhead

### For Teams  
- **Standardized Commands**: Consistent command patterns across team members
- **Documentation**: Built-in examples and common use cases
- **Scalability**: Easy to add new commands and tools

### For Maintenance
- **Centralized Updates**: Changes only need to be made in one place
- **Version Control**: Clear history of configuration changes
- **Validation**: Easier to validate configuration consistency

## Usage Examples

### Basic Commands
```
List my ADO projects
Show me failed builds in Project_001
```

### Advanced Analysis
```
Generate comprehensive failure report for build #1380 in project "Project_001"
Please create an ICM report for Project_001 last build failure
```

### Pattern Detection
```
Group failed builds by pipeline definition for "Project_001" in the last 7 days
```

## Next Steps

1. **Environment Setup**: Ensure `AZURE_DEVOPS_PAT` environment variable is set
2. **Organization Configuration**: Update default organization name if needed
3. **Team Training**: Share example commands with team members
4. **Documentation**: Update any existing documentation to reference new command patterns

## Migration Notes

- Old server name `ado` changed to `azure-devops`
- Commands remain the same, but server registration is now consolidated
- All existing functionality preserved and enhanced
- Additional tools and commands now available through unified configuration
