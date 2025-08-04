# Using Private Configuration Files

You can now use a private configuration file (`.env.local`) to store your Azure DevOps credentials and settings instead of using environment variables. This is more secure and convenient.

## 🚀 Quick Setup

### Option 1: Interactive Setup (Recommended)
```bash
./setup-config.js
```
This will guide you through creating your `.env.local` file.

### Option 2: Manual Setup
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your details:
   ```bash
   # Required settings
   AZURE_DEVOPS_ORG_URL=https://dev.azure.com/your-organization
   AZURE_DEVOPS_PAT=your-personal-access-token-here
   DEFAULT_PROJECT=YourProjectName

   # Optional settings
   MAX_BUILDS_TO_ANALYZE=10
   INCLUDE_LOGS_BY_DEFAULT=false
   PIPELINE_DEFINITIONS=123,456,789
   MIN_DATE=2025-07-01T00:00:00Z
   MAX_DATE=2025-08-04T23:59:59Z
   ```

## 🧪 Testing Your Configuration

### Run the test suite:
```bash
./test-failed-builds-tools.js
```

### Test with a specific project:
```bash
./test-failed-builds-tools.js "MyProject"
```

### Save detailed results:
```bash
SAVE_RESULTS=true ./test-failed-builds-tools.js
```

## 🔧 Configuration Options

| Setting | Description | Required | Example |
|---------|-------------|----------|---------|
| `AZURE_DEVOPS_ORG_URL` | Your Azure DevOps organization URL | ✅ | `https://dev.azure.com/mycompany` |
| `AZURE_DEVOPS_PAT` | Personal Access Token with Build permissions | ✅ | `abcd1234...` |
| `DEFAULT_PROJECT` | Default project name for testing | ✅ | `MyProject` |
| `MAX_BUILDS_TO_ANALYZE` | Maximum builds per test | ❌ | `10` |
| `INCLUDE_LOGS_BY_DEFAULT` | Include build logs in detailed analysis | ❌ | `false` |
| `PIPELINE_DEFINITIONS` | Specific pipeline IDs to focus on | ❌ | `123,456,789` |
| `MIN_DATE` | Earliest date for build analysis | ❌ | `2025-07-01T00:00:00Z` |
| `MAX_DATE` | Latest date for build analysis | ❌ | `2025-08-04T23:59:59Z` |

## 🔒 Security

- `.env.local` is automatically ignored by git (never committed)
- Your credentials stay local to your machine
- Environment variables still work and override file settings

## 🛠️ Advanced Usage

### Using with MCP Clients
The configuration is automatically loaded when you use the MCP server:

```bash
npm start
```

### Programmatic Usage
```javascript
import { loadTestConfig } from './dist/config.js';

const config = loadTestConfig();
console.log(config.defaultProject);
```

### Environment Variable Override
You can still override any setting with environment variables:
```bash
DEFAULT_PROJECT="DifferentProject" ./test-failed-builds-tools.js
```

## 📋 Example Output

```
🔧 Configuration Summary:
   Organization: https://dev.azure.com/mycompany
   Default Project: MyProject
   Max Builds: 10
   Include Logs: false
   Pipeline Definitions: 123, 456, 789
   Min Date: 2025-07-01T00:00:00.000Z

🎯 Testing project: MyProject

📊 Getting basic failed builds (last 10)
✅ Success!
📈 Found 3 results
```

## 🔍 Troubleshooting

- **"Missing required configuration"**: Make sure all required fields are set in `.env.local`
- **"Authentication failed"**: Verify your PAT has Build (read) permissions
- **"Project not found"**: Check project name is exact (case-sensitive)
- **File not found errors**: Run `npm run build` first to compile TypeScript
