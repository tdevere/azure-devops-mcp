# Testing Failed Pipeline Analysis Tools as MCP Server in VS Code

## 🎯 **Overview**
This guide shows you how to test your new failed pipeline analysis tools using VS Code with an MCP client like Claude.

## 🚀 **Step 1: Start the MCP Server**

From your terminal in VS Code:
```bash
./start-mcp-server.js
```

This will:
- Load your configuration from `.env.local`
- Extract the organization name from your Azure DevOps URL
- Start the MCP server with proper parameters
- Display connection information

You should see output like:
```
✅ Loaded configuration from .env.local
🚀 Starting Azure DevOps MCP Server...
📍 Organization: AzDevOpsSampleOrg
🔗 URL: https://dev.azure.com/AzDevOpsSampleOrg
📁 Default Project: Project_001
```

## 🔧 **Step 2: Configure MCP Client**

### **Option A: Claude for VS Code (Recommended)**

1. **Install Claude for VS Code extension** if you haven't already
2. **Configure MCP server** in your Claude settings. Use the provided configuration:

Copy from `mcp-client-config.json`:
```json
{
  "mcpServers": {
    "azure-devops-failed-pipelines": {
      "command": "node",
      "args": [
        "/workspaces/azure-devops-mcp/dist/index.js",
        "AzDevOpsSampleOrg"
      ],
      "cwd": "/workspaces/azure-devops-mcp",
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/AzDevOpsSampleOrg",
        "AZURE_DEVOPS_PAT": "your-actual-pat-token"
      }
    }
  }
}
```

**⚠️ Important**: Replace `your-actual-pat-token` with your real Personal Access Token from `.env.local`.

### **Option B: Cursor with MCP Support**

If using Cursor IDE:
```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "node",
      "args": ["/workspaces/azure-devops-mcp/dist/index.js"],
      "env": {
        "AZURE_DEVOPS_ORG_URL": "https://dev.azure.com/AzDevOpsSampleOrg",
        "AZURE_DEVOPS_PAT": "your-personal-access-token"
      }
    }
  }
}
```

## 🧪 **Step 3: Test Your New Tools**

Once connected, you can ask your AI assistant to use the new tools:

### **Basic Failed Builds Analysis**
```
Use the build_get_failed_builds tool to show me failed builds in project "Project_001". Limit to 5 results.
```

### **Detailed Failure Analysis**
```
Use build_get_failed_builds_detailed to analyze the last 3 failed builds in "Project_001" with detailed information including logs.
```

### **Failure Pattern Analysis**
```
Use build_get_failed_builds_by_definition to analyze failure patterns across all pipelines in "Project_001". Show me which pipelines fail most often.
```

### **Advanced Filtering**
```
Use build_get_failed_builds to find failed builds from the last 7 days in "Project_001", including partially succeeded and canceled builds.
```

## 📋 **Step 4: Example Test Prompts**

Copy and paste these prompts to test each tool:

### **Test 1: Quick Overview**
```
Please use the build_get_failed_builds tool with these parameters:
- project: "Project_001"
- top: 5
- includePartiallySucceeded: true

Show me a summary of what failed builds were found.
```

### **Test 2: Deep Dive**
```
Use build_get_failed_builds_detailed with:
- project: "Project_001"
- top: 2
- includeLogs: true

Analyze the error details and tell me what might be causing the failures.
```

### **Test 3: Pattern Analysis**
```
Run build_get_failed_builds_by_definition for project "Project_001" and tell me:
1. Which pipeline definitions have the most failures?
2. Are there any common failure patterns?
3. What recommendations do you have for improving build reliability?
```

## 🛠️ **Step 5: Alternative Testing Methods**

### **Direct MCP Connection Test**
You can also test the MCP connection directly:

```bash
# Test if MCP server is responding
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node -e "
const { spawn } = require('child_process');
const server = spawn('node', ['dist/index.js']);
process.stdin.pipe(server.stdin);
server.stdout.pipe(process.stdout);
"
```

### **Using MCP Client CLI**
If you have an MCP client CLI tool:
```bash
mcp-client --server "node dist/index.js" --call build_get_failed_builds --args '{"project": "Project_001", "top": 5}'
```

## 🔍 **Troubleshooting**

### **Server Not Starting**
- Check that `npm run build` completed successfully
- Verify all dependencies are installed: `npm install`
- Check for TypeScript compilation errors

### **Authentication Issues**
- Verify your `.env.local` file has correct credentials
- Test credentials with the standalone script first: `./test-failed-builds-tools.js`
- Ensure PAT has Build (read) permissions

### **MCP Connection Issues**
- Restart VS Code after configuring MCP settings
- Check VS Code/Claude extension logs for connection errors
- Verify the MCP server is still running: `ps aux | grep node`

### **Tool Not Found**
- Confirm server startup logs show all tools are registered
- Check that your MCP client is connected to the right server
- Try restarting the MCP server

## 📊 **Expected Results**

When working correctly, you should see:

1. **Tool Registration**: Server logs showing all build tools including the 3 new failed pipeline tools
2. **Successful Calls**: AI assistant successfully calling your tools and returning data
3. **Rich Analysis**: AI providing insights based on the failed build data
4. **Error Handling**: Graceful handling of invalid projects or parameters

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ MCP server starts without errors
- ✅ AI assistant can see and call your new tools
- ✅ Tools return actual failed build data from your Azure DevOps
- ✅ AI provides meaningful analysis of failure patterns

## 💡 **Pro Tips**

1. **Start Simple**: Test basic `build_get_failed_builds` first
2. **Use Real Data**: Test with projects that actually have failed builds
3. **Iterate Parameters**: Try different `top` values and filters
4. **Save Results**: Ask AI to save interesting results for later analysis
5. **Combine Tools**: Use multiple tools together for comprehensive analysis

Your failed pipeline analysis tools are now ready for production use in VS Code! 🚀
