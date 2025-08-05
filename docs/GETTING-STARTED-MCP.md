# 🚀 Getting Started with Azure DevOps MCP Pipeline Analysis

## 📋 **Prerequisites**

- **VS Code** with an AI assistant extension (Claude, GitHub Copilot, Continue, etc.)
- **Azure DevOps** organization access
- **Personal Access Token** with Build permissions
- **Node.js** 18+ (for local development)

---

## ⚡ **Quick Start (5 Minutes)**

### **Step 1: Get Your Azure DevOps Credentials**

1. **Create a Personal Access Token:**
   - Go to `https://dev.azure.com/{your-org}/_usersSettings/tokens`
   - Create new token with **Build (Read)** permissions
   - Copy the token (you won't see it again!)

2. **Note your organization name:**
   - From URL: `https://dev.azure.com/YourOrgName`
   - You'll need just `YourOrgName`

### **Step 2: Set Up MCP Server**

#### **Option A: Use Published Package (Recommended)**
```bash
# Install the MCP server globally
npm install -g @azure-devops/mcp

# Or use npx (no installation required)
npx @azure-devops/mcp --help
```

#### **Option B: Use This Repository**
```bash
# Clone and build
git clone https://github.com/tdevere/azure-devops-mcp.git
cd azure-devops-mcp
npm install
npm run build
```

### **Step 3: Configure Your AI Assistant**

Choose your VS Code AI extension:

#### **🤖 For Claude for VS Code:**

1. Open VS Code settings (Ctrl/Cmd + ,)
2. Search for "Claude MCP"
3. Add MCP server configuration:

```json
{
  "mcpServers": {
    "azure-devops": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "YourOrgName"],
      "env": {
        "AZURE_DEVOPS_PAT": "your-personal-access-token"
      }
    }
  }
}
```

#### **🔄 For Continue Extension:**

Edit `~/.continue/config.json`:

```json
{
  "mcpServers": {
    "azure-devops": {
      "transport": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@azure-devops/mcp", "YourOrgName"],
        "env": {
          "AZURE_DEVOPS_PAT": "your-personal-access-token"
        }
      }
    }
  }
}
```

#### **🎯 For Cline (formerly Claude Dev):**

In Cline settings, add MCP server:
- **Command:** `npx`
- **Args:** `["-y", "@azure-devops/mcp", "YourOrgName"]`
- **Environment:** `AZURE_DEVOPS_PAT=your-token`

### **Step 4: Verify Setup**

1. **Restart VS Code**
2. **Open your AI assistant**
3. **Ask:** "What MCP tools are available?"
4. **Look for:** Azure DevOps build tools including:
   - `build_get_failed_builds`
   - `build_get_failed_builds_detailed`
   - `build_get_failed_builds_by_definition`

---

## 🎯 **Test Your Setup**

### **Basic Test:**
```
Ask your AI: "Use build_get_failed_builds to show me the last 5 failed builds in project 'YourProject'"
```

### **Advanced Test:**
```
Ask your AI: "Group the failed builds by pipeline definition and show me which pipelines are failing most"
```

### **Deep Analysis:**
```
Ask your AI: "Get detailed information about recent failed builds including logs"
```

---

## 📊 **Available Tools**

### **🔍 Pipeline Failure Analysis Tools**

| Tool | Purpose | Example Use |
|------|---------|-------------|
| `build_get_failed_builds` | Get list of failed builds | Daily standup review |
| `build_get_failed_builds_by_definition` | Group failures by pipeline | Pattern identification |
| `build_get_failed_builds_detailed` | Deep dive with logs | Root cause analysis |

### **🛠️ Standard Azure DevOps Tools**

| Tool | Purpose |
|------|---------|
| `build_get_builds` | List all builds |
| `build_get_definition_revisions` | Pipeline history |
| `build_get_definitions` | Available pipelines |
| `build_get_log` | Specific build logs |
| `build_run_build` | Trigger new build |

---

## 💡 **Pro Tips**

### **🔒 Security Best Practices:**

1. **Use environment variables** for PAT tokens
2. **Limit token scope** to minimum required permissions
3. **Rotate tokens regularly** (Azure DevOps recommendation: 90 days)
4. **Don't commit tokens** to source control

### **⚡ Performance Optimization:**

1. **Filter by date range** for faster queries:
   ```
   "Show failed builds from the last 24 hours"
   ```

2. **Use specific projects** to reduce data:
   ```
   "Get failed builds for project 'ProjectName' only"
   ```

3. **Combine tools** for efficient analysis:
   ```
   "First show me failed builds grouped by definition, then get details for the most frequent failures"
   ```

### **🎯 Common Workflows:**

#### **Daily Standup Prep:**
```
1. "Show me all failed builds from yesterday"
2. "Group these by pipeline definition"
3. "Which team member requested the most recent failures?"
```

#### **Sprint Retrospective:**
```
1. "Get detailed failed builds from the last 2 weeks"
2. "What patterns do you see in the failure data?"
3. "Which pipelines need attention?"
```

#### **Incident Response:**
```
1. "Show me failed builds from the last 4 hours"
2. "Get detailed logs for the most recent failure"
3. "What changed in this build compared to the last successful one?"
```

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **❌ "No tools available"**
- **Check:** VS Code extension is properly configured
- **Verify:** MCP server configuration syntax
- **Try:** Restart VS Code after configuration changes

#### **❌ "Authentication failed"**
- **Check:** Personal Access Token is valid and not expired
- **Verify:** Token has Build (Read) permissions
- **Test:** Token works with Azure DevOps REST API directly

#### **❌ "Project not found"**
- **Check:** Project name spelling and casing
- **Verify:** You have access to the project
- **Try:** Use project GUID instead of name

#### **❌ "Command not found"**
- **Check:** Node.js 18+ is installed
- **Verify:** npx is available in PATH
- **Try:** Install package globally: `npm install -g @azure-devops/mcp`

### **Getting Help:**

1. **Check logs** in VS Code Developer Console (F12)
2. **Test with command line** first: `npx @azure-devops/mcp --help`
3. **Verify credentials** with Azure DevOps web interface
4. **Report issues** on GitHub repository

---

## 🚀 **Advanced Configuration**

### **Multiple Organizations:**

Configure different servers for different orgs:

```json
{
  "mcpServers": {
    "ado-prod": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "ProdOrg"],
      "env": {
        "AZURE_DEVOPS_PAT": "prod-token"
      }
    },
    "ado-dev": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "DevOrg"],
      "env": {
        "AZURE_DEVOPS_PAT": "dev-token"
      }
    }
  }
}
```

### **Custom Timeouts:**

For large organizations, increase timeouts:

```json
{
  "env": {
    "AZURE_DEVOPS_PAT": "your-token",
    "MCP_TIMEOUT": "30000"
  }
}
```

### **Debug Mode:**

Enable verbose logging:

```json
{
  "env": {
    "AZURE_DEVOPS_PAT": "your-token",
    "DEBUG": "azure-devops-mcp:*"
  }
}
```

---

## 🎉 **You're Ready!**

You now have **AI-powered Azure DevOps pipeline analysis** at your fingertips!

**Next Steps:**
- 🔍 **Explore** the failure analysis tools with your real projects
- 📊 **Share insights** with your team from the analysis
- 🚀 **Automate** your daily pipeline health checks
- 💡 **Discover** new patterns in your build data

**Questions or feedback?** Check out our [Team Challenge document](TEAM-CHALLENGE.md) for ways to contribute!

---

*Happy analyzing! 🚀*
