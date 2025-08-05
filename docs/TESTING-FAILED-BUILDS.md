# Testing the Failed Pipeline Analysis Tools

## Prerequisites

1. **Azure DevOps Setup**: You need access to an Azure DevOps organization and project
2. **Authentication**: Set up authentication (Personal Access Token or Azure CLI)
3. **MCP Server Running**: Start the MCP server

## Method 1: Testing with VS Code + MCP Client

### 1. Start the MCP Server
```bash
npm run build
node dist/index.js
```

### 2. Configure MCP in your client
Add to your MCP client configuration:
```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "node",
      "args": ["/path/to/azure-devops-mcp/dist/index.js"],
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/your-org",
        "AZURE_DEVOPS_PAT": "your-pat-token"
      }
    }
  }
}
```

### 3. Test the new tools
Ask your AI assistant to use these tools:

**Basic failed builds:**
"Use build_get_failed_builds to show me failed builds in project 'MyProject'"

**Detailed analysis:**
"Use build_get_failed_builds_detailed to analyze failed builds in 'MyProject' from the last 7 days"

**Pattern analysis:**
"Use build_get_failed_builds_by_definition to show failure patterns across all pipelines in 'MyProject'"

## Method 2: Manual Testing with Node.js

You can also test directly by importing and calling the functions:

### 1. Create a test script
```bash
# Create a test file
cat > test-failed-builds.js << 'EOF'
import { configureBuildTools } from './dist/tools/builds.js';
import { WebApi } from 'azure-devops-node-api';

// Mock MCP server for testing
const mockServer = {
  tools: new Map(),
  tool(name, description, schema, handler) {
    this.tools.set(name, { name, description, schema, handler });
  }
};

// Your Azure DevOps connection setup
const orgUrl = process.env.AZURE_DEVOPS_ORG_URL || 'https://dev.azure.com/your-org';
const token = process.env.AZURE_DEVOPS_PAT || 'your-pat-token';

const tokenProvider = async () => ({ token, expiresOnTimestamp: Date.now() + 3600000 });
const connectionProvider = async () => new WebApi(orgUrl, { accessToken: token });

// Configure tools
configureBuildTools(mockServer, tokenProvider, connectionProvider);

// Test the failed builds tool
async function testFailedBuilds() {
  const tool = mockServer.tools.get('build_get_failed_builds');
  if (tool) {
    try {
      const result = await tool.handler({
        project: 'YourProjectName',
        top: 5,
        includePartiallySucceeded: true
      });
      console.log('Failed builds:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

testFailedBuilds();
EOF

# Run the test
node test-failed-builds.js
```

## Method 3: Unit Testing

Add unit tests to verify the tools work correctly:

### 1. Create test cases
```bash
# Add to test/src/tools/builds.test.ts
```

## Method 4: Integration Testing with Real Data

### 1. Set up environment variables
```bash
export AZURE_DEVOPS_ORG_URL="https://dev.azure.com/your-org"
export AZURE_DEVOPS_PAT="your-personal-access-token"
```

### 2. Test with different scenarios:

**Recent failures only:**
```json
{
  "project": "YourProject",
  "minTime": "2025-08-01T00:00:00Z",
  "top": 10
}
```

**Specific pipeline failures:**
```json
{
  "project": "YourProject",
  "definitions": [123, 456],
  "includePartiallySucceeded": true
}
```

**Detailed analysis with logs:**
```json
{
  "project": "YourProject",
  "top": 3,
  "includeLogs": true
}
```

## Expected Outputs

### build_get_failed_builds
- Array of build objects with basic information
- Filtered to only show Failed builds (and optionally PartiallySucceeded/Canceled)

### build_get_failed_builds_detailed
- Same as above but with additional `buildReport` and `buildLogs` properties
- More detailed error information

### build_get_failed_builds_by_definition
- Structured object grouped by pipeline definition
- Summary statistics about failure patterns
- Analysis of failure reasons per pipeline

## Troubleshooting

- **Authentication errors**: Verify your PAT has Build (read) permissions
- **Project not found**: Check project name/ID is correct
- **No failed builds**: The tools only return builds with Failed result status
- **API limits**: Be mindful of API rate limits when testing with large datasets
