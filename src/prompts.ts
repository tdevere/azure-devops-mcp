// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CORE_TOOLS } from "./tools/core.js";
import { WORKITEM_TOOLS } from "./tools/workitems.js";
import { BUILD_TOOLS } from "./tools/builds.js";

function configurePrompts(server: McpServer) {
  server.prompt("listProjects", "Lists all projects in the Azure DevOps organization.", {}, () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: String.raw`
# Task
Use the '${CORE_TOOLS.list_projects}' tool to retrieve all projects in the current Azure DevOps organization.
Present the results in a table with the following columns: Project ID, Name, and Description.`,
        },
      },
    ],
  }));

  server.prompt("listTeams", "Retrieves all teams for a given Azure DevOps project.", { project: z.string() }, ({ project }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: String.raw`
  # Task
  Use the '${CORE_TOOLS.list_project_teams}' tool to retrieve all teams for the project '${project}'.
  Present the results in a table with the following columns: Team ID, and Name`,
        },
      },
    ],
  }));

  server.prompt(
    "getWorkItem",
    "Retrieves details for a specific Azure DevOps work item by ID.",
    { id: z.string().describe("The ID of the work item to retrieve."), project: z.string().describe("The name or ID of the Azure DevOps project.") },
    ({ id, project }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: String.raw`
  # Task
  Use the '${WORKITEM_TOOLS.get_work_item}' tool to retrieve details for the work item with ID '${id}' in project '${project}'.
  Present the following fields: ID, Title, State, Assigned To, Work Item Type, Description or Repro Steps, and Created Date.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "listFailedBuilds",
    "Lists recent failed builds in an Azure DevOps project to help identify issues.",
    { project: z.string().describe("The name or ID of the Azure DevOps project.") },
    ({ project }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: String.raw`
# Task
Use the '${BUILD_TOOLS.get_failed_builds}' tool to retrieve recent failed builds for project '${project}'.
Present the results in a table with columns: Build ID, Build Number, Definition Name, Status, Start Time, and Finish Time.
Focus on builds from the last 7 days and limit to 10 most recent failures.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "analyzeFailurePatterns",
    "Analyzes build failure patterns across pipeline definitions to identify systematic issues.",
    { project: z.string().describe("The name or ID of the Azure DevOps project.") },
    ({ project }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: String.raw`
# Task
Use the '${BUILD_TOOLS.get_failed_builds_by_definition}' tool to analyze failure patterns in project '${project}'.
Group the results by pipeline definition and identify:
1. Which pipelines are failing most frequently
2. Patterns in failure timing
3. Recommendations for investigation priorities
Present findings in a summary format with key insights highlighted.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "generateFailureReport",
    "Generates a comprehensive AI-powered failure analysis report for a specific build.",
    {
      project: z.string().describe("The name or ID of the Azure DevOps project."),
      buildId: z.string().describe("The ID of the failed build to analyze.")
    },
    ({ project, buildId }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: String.raw`
# Task
Use the '${BUILD_TOOLS.generate_failure_report}' tool to generate a comprehensive failure analysis for build #${buildId} in project '${project}'.

Configure the analysis with these parameters:
- Include full logs and environment details
- Analyze the last 30 days for failure patterns
- Include diff analysis with the last successful build
- Output in markdown format for easy reading

Present the report with clear sections for:
1. Executive Summary with root cause
2. Key recommendations prioritized by impact
3. Timeline of the failure progression
4. Related issues and patterns
5. Actionable next steps for the development team`,
          },
        },
      ],
    })
  );

  server.prompt(
    "buildFailureTriage",
    "Performs intelligent triage of build failures to prioritize investigation efforts.",
    { project: z.string().describe("The name or ID of the Azure DevOps project.") },
    ({ project }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: String.raw`
# Task
Perform intelligent build failure triage for project '${project}' using multiple tools:

1. First, use '${BUILD_TOOLS.get_failed_builds}' to get recent failed builds
2. Then, use '${BUILD_TOOLS.get_failed_builds_by_definition}' to identify patterns
3. For the most critical failure, use '${BUILD_TOOLS.generate_failure_report}' to get detailed analysis

Present a triage summary with:
- Priority ranking of failures (Critical/High/Medium/Low)
- Estimated impact on development workflow
- Recommended investigation order
- Quick wins vs. complex issues
- Team assignments suggestions based on failure types`,
          },
        },
      ],
    })
  );
}

export { configurePrompts };
