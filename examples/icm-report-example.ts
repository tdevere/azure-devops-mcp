// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Example: Generate ICM Report from Azure DevOps Pipeline Failure
// This script demonstrates how to integrate the ICM report generator with
// Azure DevOps MCP tools to automatically create incident reports

import { ICMReportGenerator, PipelineFailureData, createICMReportFromFailure } from '../src/icm/icm-report-generator.js';

/**
 * Simulate getting pipeline failure data from Azure DevOps MCP tools
 * In real implementation, this would use the actual MCP tools:
 * - mcp_ado_build_get_failed_builds
 * - mcp_ado_build_generate_failure_report
 * - mcp_ado_build_get_failed_builds_detailed
 */
function simulateGetPipelineFailureData(): PipelineFailureData {
  // This would typically come from calling Azure DevOps MCP tools
  return {
    organizationName: 'contoso-corp',
    failureType: 'Infrastructure failure',
    failureStage: 'Agent allocation',
    affectedUsers: 275,
    impactLevel: 'High - Major functionality impaired',
    errorMessages: [
      'No agents available in pool "Build-Pool-Production"',
      'Agent allocation timeout after 10 minutes',
      'Pool capacity exceeded: 0/50 agents available'
    ],
    troubleshootingSteps: [
      {
        step: 'Checked agent pool status using Azure DevOps REST API',
        result: 'All 50 agents in offline state',
        timestamp: '2025-08-06T14:30:00Z',
        performedBy: 'Azure DevOps Support'
      },
      {
        step: 'Investigated agent pool infrastructure',
        result: 'VMSS scale set experiencing connectivity issues',
        timestamp: '2025-08-06T14:45:00Z',
        performedBy: 'Infrastructure Team'
      },
      {
        step: 'Initiated agent pool recovery procedure',
        result: 'Restarted VMSS instances, 35/50 agents back online',
        timestamp: '2025-08-06T15:00:00Z',
        performedBy: 'Infrastructure Team'
      },
      {
        step: 'Monitored pipeline queue processing',
        result: 'Queue backlog processing resumed, estimated clear time 2 hours',
        timestamp: '2025-08-06T15:15:00Z',
        performedBy: 'Azure DevOps Support'
      }
    ]
  };
}

/**
 * Main function to demonstrate ICM report generation
 */
async function generateICMReportExample(): Promise<void> {
  console.log('🚀 Azure DevOps Pipeline Failure ICM Report Generator');
  console.log('==================================================\n');

  try {
    // Step 1: Get pipeline failure data (normally from MCP tools)
    console.log('📊 Gathering pipeline failure data...');
    const failureData = simulateGetPipelineFailureData();

    console.log(`   Organization: ${failureData.organizationName}`);
    console.log(`   Failure Type: ${failureData.failureType}`);
    console.log(`   Failure Stage: ${failureData.failureStage}`);
    console.log(`   Affected Users: ${failureData.affectedUsers}`);
    console.log(`   Impact Level: ${failureData.impactLevel}\n`);

    // Step 2: Generate ICM report
    console.log('📝 Generating ICM report...');
    const icmReport = createICMReportFromFailure(failureData);

    console.log(`   ICM Severity: ${icmReport.severity}`);
    console.log(`   Owning Team: ${icmReport.owningTeam}`);
    console.log(`   Root Cause Category: ${icmReport.rootCauseCategory}`);
    console.log(`   Customer Notification Required: ${icmReport.communicationPlan.customerNotification}`);
    console.log(`   Escalation Required: ${icmReport.communicationPlan.escalationRequired}\n`);

    // Step 3: Validate report for ICM creation
    console.log('✅ Validating ICM report...');
    const generator = new ICMReportGenerator();
    const validation = generator.validateForICMCreation(icmReport);

    if (validation.valid) {
      console.log('   ✓ Report is valid for ICM creation');
    } else {
      console.log('   ❌ Report validation failed');
      console.log(`   Missing fields: ${validation.missingFields.join(', ')}`);
    }

    // Step 4: Display full ICM report
    console.log('\n📄 Generated ICM Report:');
    console.log('========================');
    console.log(`Title: ${icmReport.incidentSummary}`);
    console.log(`Severity: ${icmReport.severity}`);
    console.log(`Owning Team: ${icmReport.owningTeam}`);
    console.log(`Root Cause: ${icmReport.rootCauseCategory}\n`);

    console.log('Description:');
    console.log(icmReport.incidentDescription);

    console.log('\nMitigation Actions:');
    icmReport.mitigationActions.forEach((action: { action: string; performedBy: string; timestamp: string; effectiveness?: string }, index: number) => {
      console.log(`${index + 1}. ${action.action}`);
      console.log(`   Performed by: ${action.performedBy}`);
      console.log(`   Time: ${action.timestamp}`);
      console.log(`   Effectiveness: ${action.effectiveness}\n`);
    });

    // Step 5: Export report to file
    const outputPath = './icm-report-example.json';
    generator.exportReport(icmReport, outputPath);
    console.log(`💾 ICM report exported to: ${outputPath}`);

    console.log('\n🎉 ICM report generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating ICM report:', error);
    process.exit(1);
  }
}

/**
 * Integration example with Azure DevOps MCP tools
 */
async function integrateWithMCPTools(): Promise<void> {
  console.log('\n🔗 Azure DevOps MCP Tools Integration Example');
  console.log('=============================================\n');

  console.log('To integrate with actual Azure DevOps MCP tools:');
  console.log('');
  console.log('1. Get failed builds:');
  console.log('   const failedBuilds = await mcp_ado_build_get_failed_builds({');
  console.log('     project: "your-project",');
  console.log('     top: 10');
  console.log('   });');
  console.log('');
  console.log('2. Generate detailed failure report:');
  console.log('   const failureReport = await mcp_ado_build_generate_failure_report({');
  console.log('     project: "your-project",');
  console.log('     buildId: failedBuilds[0].id,');
  console.log('     includeDiffAnalysis: true,');
  console.log('     includeFullLogs: true');
  console.log('   });');
  console.log('');
  console.log('3. Convert to PipelineFailureData and generate ICM report:');
  console.log('   const failureData = convertFailureReportToData(failureReport);');
  console.log('   const icmReport = createICMReportFromFailure(failureData);');
  console.log('');
  console.log('4. Create ICM incident automatically:');
  console.log('   if (icmReport.severity === "Sev1" || icmReport.severity === "Sev2") {');
  console.log('     await createICMIncident(icmReport);');
  console.log('   }');
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  generateICMReportExample()
    .then(() => integrateWithMCPTools())
    .catch(error => {
      console.error('Example execution failed:', error);
      process.exit(1);
    });
}

export { generateICMReportExample, integrateWithMCPTools };
