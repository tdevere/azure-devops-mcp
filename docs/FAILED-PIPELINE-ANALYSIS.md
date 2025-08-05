# Failed Pipeline Analysis Tools

This feature branch adds three new tools to the Azure DevOps MCP server to help identify and analyze failed pipelines in one comprehensive view.

## New Tools

### 1. `build_get_failed_builds`
Retrieves a list of failed builds across all pipelines in a project.

**Parameters:**
- `project` (required): Project ID or name to get failed builds for
- `definitions` (optional): Array of build definition IDs to filter builds
- `top` (optional, default: 50): Maximum number of failed builds to return
- `minTime` (optional): Minimum finish time to filter builds
- `maxTime` (optional): Maximum finish time to filter builds
- `includePartiallySucceeded` (optional, default: false): Include partially succeeded builds as failures
- `includeCanceled` (optional, default: false): Include canceled builds as failures

**Use Case:** Get a quick overview of recent failed builds across all pipelines.

### 2. `build_get_failed_builds_detailed`
Retrieves detailed information about failed builds including logs and error details.

**Parameters:**
- `project` (required): Project ID or name to get failed builds for
- `definitions` (optional): Array of build definition IDs to filter builds
- `top` (optional, default: 10): Maximum number of failed builds to analyze in detail
- `minTime` (optional): Minimum finish time to filter builds
- `maxTime` (optional): Maximum finish time to filter builds
- `includePartiallySucceeded` (optional, default: false): Include partially succeeded builds as failures
- `includeCanceled` (optional, default: false): Include canceled builds as failures
- `includeLogs` (optional, default: true): Include build logs in the detailed output

**Use Case:** Deep dive into specific failed builds to understand error details and log information.

### 3. `build_get_failed_builds_by_definition`
Retrieves failed builds grouped by build definition, showing failure patterns across pipelines.

**Parameters:**
- `project` (required): Project ID or name to get failed builds for
- `definitions` (optional): Array of specific build definition IDs to analyze
- `top` (optional, default: 10): Maximum number of failed builds per definition to return
- `minTime` (optional): Minimum finish time to filter builds
- `maxTime` (optional): Maximum finish time to filter builds
- `includePartiallySucceeded` (optional, default: false): Include partially succeeded builds as failures
- `includeCanceled` (optional, default: false): Include canceled builds as failures
- `includeSummary` (optional, default: true): Include failure summary statistics per definition

**Use Case:** Analyze failure patterns across different pipelines to identify systematic issues or frequently failing pipelines.

## Build Result Types

The tools filter for the following Azure DevOps build results:
- **Failed** (BuildResult.Failed = 8): Build completed with errors
- **PartiallySucceeded** (BuildResult.PartiallySucceeded = 4): Build completed with warnings (optional)
- **Canceled** (BuildResult.Canceled = 32): Build was canceled before completion (optional)

## Example Usage Scenarios

1. **Daily Failure Review**: Use `build_get_failed_builds` to get a daily summary of all failed builds
2. **Debugging Specific Failures**: Use `build_get_failed_builds_detailed` to get logs and detailed information for troubleshooting
3. **Pipeline Health Analysis**: Use `build_get_failed_builds_by_definition` to identify which pipelines fail most frequently and track failure trends

## Implementation Details

- All tools leverage the existing Azure DevOps REST API through the `azure-devops-node-api` package
- Results are returned in JSON format for easy consumption by AI assistants and other tools
- Error handling is implemented for API failures and missing data
- Tools support time-based filtering for focused analysis periods
