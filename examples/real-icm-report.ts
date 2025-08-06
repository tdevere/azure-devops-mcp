// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Real Azure DevOps Build Failure ICM Report Generator
// Uses actual failure data from your organization to generate ICM reports

import { ICMReportGenerator, PipelineFailureData, createICMReportFromFailure } from '../src/icm/icm-report-generator.js';

interface FailureReportTask {
  taskName: string;
  displayName: string;
  result: string;
  errorDetails: {
    errorMessage: string;
    errorCode?: string;
  };
  finishTime?: string;
}

interface FailureReport {
  metadata: {
    buildId: number;
    buildNumber: string;
    definitionName: string;
    branch: string;
    repository: string;
    requestedBy: string;
    result: string;
  };
  summary: {
    primaryFailureType: string;
    failureCategory: string;
    confidenceScore: number;
    isRecurrentFailure: boolean;
    failureFrequency: {
      occurrencesLast7d: number;
      patternDetected: boolean;
    };
    impactAssessment: {
      blockingDeployment: boolean;
      customerImpact: string;
    };
  };
  rootCauseAnalysis: {
    primaryCause: string;
    errorClassification: {
      category: string;
      severity: string;
    };
  };
  taskAnalysis: FailureReportTask[];
}

/**
 * Convert Azure DevOps MCP failure report to PipelineFailureData format
 */
function convertMCPFailureReportToPipelineData(failureReport: FailureReport): PipelineFailureData {
  const summary = failureReport.summary;
  const rootCause = failureReport.rootCauseAnalysis;
  const taskAnalysis = failureReport.taskAnalysis;

  // Determine failure stage from the primary failure
  let failureStage = 'Build/Compilation';
  if (summary.primaryFailureType === 'test_failure') {
    failureStage = 'Test execution';
  } else if (rootCause.primaryCause.includes('agent')) {
    failureStage = 'Agent allocation';
  } else if (rootCause.primaryCause.includes('checkout')) {
    failureStage = 'Source checkout';
  }

  // Determine failure type from error messages
  let failureType = 'Code/compilation error';
  const errorMessages = taskAnalysis
    .filter((task: FailureReportTask) => task.errorDetails.errorMessage)
    .map((task: FailureReportTask) => task.errorDetails.errorMessage);

  if (errorMessages.some((msg: string) => msg.includes('pwsh') || msg.includes('PowerShell'))) {
    failureType = 'Configuration error';
  } else if (summary.primaryFailureType === 'test_failure') {
    failureType = 'Test failure';
  }

  // Determine impact level based on recurrence and blocking status
  let impactLevel = 'Medium - Some functionality affected';
  if (summary.isRecurrentFailure && summary.impactAssessment.blockingDeployment) {
    impactLevel = 'High - Major functionality impaired';
  }
  if (summary.failureFrequency.occurrencesLast7d >= 5) {
    impactLevel = 'High - Major functionality impaired';
  }

  // Create troubleshooting steps from timeline and recommendations
  const troubleshootingSteps = [
    {
      step: 'Analyzed build failure report using Azure DevOps MCP tools',
      result: `Found ${summary.primaryFailureType} with confidence score ${summary.confidenceScore}`,
      timestamp: new Date().toISOString(),
      performedBy: 'Azure DevOps MCP System'
    },
    {
      step: 'Identified root cause analysis',
      result: rootCause.primaryCause,
      timestamp: new Date().toISOString(),
      performedBy: 'Azure DevOps MCP System'
    },
    {
      step: 'Checked failure frequency pattern',
      result: `Found ${summary.failureFrequency.occurrencesLast7d} occurrences in last 7 days, pattern detected: ${summary.failureFrequency.patternDetected}`,
      timestamp: new Date().toISOString(),
      performedBy: 'Azure DevOps MCP System'
    }
  ];

  // Add specific task failure troubleshooting
  taskAnalysis.forEach((task: FailureReportTask) => {
    if (task.result === '2' && task.errorDetails.errorMessage) {
      troubleshootingSteps.push({
        step: `Analyzed task '${task.displayName}' failure`,
        result: `Error: ${task.errorDetails.errorMessage}`,
        timestamp: task.finishTime || new Date().toISOString(),
        performedBy: 'Azure DevOps MCP System'
      });
    }
  });

  return {
    organizationName: 'AzDevOpsSampleOrg',
    failureType: failureType,
    failureStage: failureStage,
    affectedUsers: summary.isRecurrentFailure ? 50 : 10, // Estimate based on recurrence
    impactLevel: impactLevel,
    errorMessages: errorMessages,
    troubleshootingSteps: troubleshootingSteps
  };
}

/**
 * Generate ICM report from real Azure DevOps failure data
 */
async function generateRealICMReport(): Promise<void> {
  console.log('🚀 Real Azure DevOps Pipeline Failure ICM Report');
  console.log('================================================\n');

  // This would normally come from the MCP tool call
  const realFailureReport = {
    "metadata": {
      "reportId": "failure-report-1380-1754497352933",
      "generatedAt": "2025-08-06T16:22:33.896Z",
      "project": "Project_001",
      "buildId": 1380,
      "buildNumber": "20250801.7",
      "definitionName": "DNSTESTER (29)",
      "branch": "refs/heads/network",
      "repository": "DNSTESTER",
      "requestedBy": "Anthony DeVere",
      "result": "Failed"
    },
    "summary": {
      "primaryFailureType": "test_failure",
      "failureCategory": "persistent",
      "confidenceScore": 0.8,
      "isRecurrentFailure": true,
      "failureFrequency": {
        "occurrencesLast7d": 6,
        "patternDetected": true
      },
      "impactAssessment": {
        "blockingDeployment": true,
        "customerImpact": "medium"
      }
    },
    "rootCauseAnalysis": {
      "primaryCause": "PowerShell Core (pwsh) not available in build environment",
      "errorClassification": {
        "category": "Configuration Error",
        "severity": "high"
      }
    },
    "taskAnalysis": [
      {
        "taskName": "Test Summary",
        "displayName": "PowerShell",
        "result": "2",
        "errorDetails": {
          "errorMessage": "Unable to locate executable file: 'pwsh'. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable.",
          "errorCode": "1"
        },
        "finishTime": "2025-08-01T21:17:22.893Z"
      },
      {
        "taskName": "Publish Test Logs",
        "displayName": "PublishBuildArtifacts",
        "result": "2",
        "errorDetails": {
          "errorMessage": "Publishing build artifacts failed with an error: Not found PathtoPublish: /mnt/vss/_work/_temp/keyvault-test-results.txt",
          "errorCode": "1"
        },
        "finishTime": "2025-08-01T21:17:20.836Z"
      }
    ]
  };

  try {
    console.log('📊 Processing real failure data...');
    console.log(`   Build: ${realFailureReport.metadata.buildNumber} (${realFailureReport.metadata.buildId})`);
    console.log(`   Pipeline: ${realFailureReport.metadata.definitionName}`);
    console.log(`   Repository: ${realFailureReport.metadata.repository}`);
    console.log(`   Branch: ${realFailureReport.metadata.branch}`);
    console.log(`   Requested by: ${realFailureReport.metadata.requestedBy}`);
    console.log(`   Primary Failure: ${realFailureReport.summary.primaryFailureType}`);
    console.log(`   Recurrent: ${realFailureReport.summary.isRecurrentFailure}`);
    console.log(`   Occurrences (7d): ${realFailureReport.summary.failureFrequency.occurrencesLast7d}\n`);

    // Convert to PipelineFailureData format
    const pipelineFailureData = convertMCPFailureReportToPipelineData(realFailureReport);

    console.log('📝 Generating ICM report...');
    const icmReport = createICMReportFromFailure(pipelineFailureData);

    console.log(`   ICM Severity: ${icmReport.severity}`);
    console.log(`   Owning Team: ${icmReport.owningTeam}`);
    console.log(`   Root Cause Category: ${icmReport.rootCauseCategory}`);
    console.log(`   Customer Notification Required: ${icmReport.communicationPlan.customerNotification}`);
    console.log(`   Escalation Required: ${icmReport.communicationPlan.escalationRequired}\n`);

    // Validate report
    console.log('✅ Validating ICM report...');
    const generator = new ICMReportGenerator();
    const validation = generator.validateForICMCreation(icmReport);

    if (validation.valid) {
      console.log('   ✓ Report is valid for ICM creation');
    } else {
      console.log('   ❌ Report validation failed');
      console.log(`   Missing fields: ${validation.missingFields.join(', ')}`);
    }

    // Display full ICM report
    console.log('\n📄 Generated ICM Report for Real Build Failure:');
    console.log('==============================================');
    console.log(`Title: ${icmReport.incidentSummary}`);
    console.log(`Severity: ${icmReport.severity}`);
    console.log(`Owning Team: ${icmReport.owningTeam}`);
    console.log(`Root Cause: ${icmReport.rootCauseCategory}\n`);

    console.log('Description:');
    console.log(icmReport.incidentDescription);

    console.log('\nMitigation Actions Taken:');
    icmReport.mitigationActions.forEach((action: { action: string; performedBy: string; timestamp: string; effectiveness?: string }, index: number) => {
      console.log(`${index + 1}. ${action.action}`);
      console.log(`   Performed by: ${action.performedBy}`);
      console.log(`   Time: ${action.timestamp}`);
      console.log(`   Effectiveness: ${action.effectiveness}\n`);
    });

    // Export report
    const outputPath = './real-build-failure-icm-report.json';
    generator.exportReport(icmReport, outputPath);
    console.log(`💾 ICM report exported to: ${outputPath}`);

    console.log('\n🎯 Key Insights from Real Data:');
    console.log('===============================');
    console.log('• PowerShell Core (pwsh) missing from build environment');
    console.log('• Recurring issue (6 occurrences in 7 days)');
    console.log('• Affects Key Vault access testing pipeline');
    console.log('• Missing test artifacts causing publish failures');
    console.log('• Configuration issue requiring environment update');

    console.log('\n🔧 Recommended Actions:');
    console.log('======================');
    console.log('1. Install PowerShell Core on build agents');
    console.log('2. Update pipeline to ensure pwsh is available');
    console.log('3. Fix test artifact publishing paths');
    console.log('4. Add pre-build validation for required tools');
    console.log('5. Monitor for similar environment configuration issues');

    console.log('\n🎉 Real ICM report generation completed successfully!');

  } catch (error) {
    console.error('❌ Error generating real ICM report:', error);
    process.exit(1);
  }
}

// Run with real data
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRealICMReport().catch(error => {
    console.error('Real example execution failed:', error);
    process.exit(1);
  });
}

export { generateRealICMReport, convertMCPFailureReportToPipelineData };
