// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICMReportGenerator, PipelineFailureData } from '../../../src/icm/icm-report-generator';

describe('ICMReportGenerator', () => {
  let generator: ICMReportGenerator;

  beforeEach(() => {
    generator = new ICMReportGenerator();
  });

  it('should generate ICM report from pipeline failure data', () => {
    const failureData: PipelineFailureData = {
      organizationName: 'contoso',
      failureType: 'Infrastructure failure',
      failureStage: 'Agent allocation',
      affectedUsers: 150,
      impactLevel: 'High - Major functionality impaired',
      errorMessages: [
        'Unable to allocate agent from pool',
        'Agent initialization timeout'
      ],
      troubleshootingSteps: [
        {
          step: 'Checked agent pool availability',
          result: 'No agents available in pool',
          timestamp: '2025-08-06T10:00:00Z',
          performedBy: 'Support Engineer'
        },
        {
          step: 'Restarted agent pool',
          result: 'Successful restart',
          timestamp: '2025-08-06T10:15:00Z',
          performedBy: 'Infrastructure Team'
        }
      ]
    };

    const icmReport = generator.generateICMReport(failureData);

    expect(icmReport.incidentSummary).toBe('Pipeline failure in contoso: Infrastructure failure affecting 150 users');
    expect(icmReport.severity).toBe('Sev2');
    expect(icmReport.owningTeam).toBe('Azure DevOps - Platform');
    expect(icmReport.rootCauseCategory).toBe('Infrastructure failure');
    expect(icmReport.mitigationActions).toHaveLength(2);
    expect(icmReport.communicationPlan.customerNotification).toBe(true);
    expect(icmReport.communicationPlan.escalationRequired).toBe(false);
  });

  it('should map critical impact to Sev1', () => {
    const failureData: PipelineFailureData = {
      organizationName: 'contoso',
      failureType: 'Infrastructure failure',
      failureStage: 'Build/Compilation',
      affectedUsers: 5000,
      impactLevel: 'Critical - Complete service down',
      errorMessages: ['Service completely unavailable'],
      troubleshootingSteps: []
    };

    const icmReport = generator.generateICMReport(failureData);

    expect(icmReport.severity).toBe('Sev1');
    expect(icmReport.communicationPlan.escalationRequired).toBe(true);
    expect(icmReport.communicationPlan.publicStatusPage).toBe(true);
  });

  it('should validate required fields for ICM creation', () => {
    const incompleteReport = {
      incidentSummary: 'Test incident',
      incidentDescription: '',
      severity: 'Sev3' as const,
      owningTeam: '',
      mitigationActions: [],
      communicationPlan: {
        customerNotification: false,
        internalNotification: true
      }
    };

    const validation = generator.validateForICMCreation(incompleteReport);

    expect(validation.valid).toBe(false);
    expect(validation.missingFields.length).toBeGreaterThan(0);
  });

  it('should determine correct owning team based on failure stage', () => {
    const testCases = [
      { failureStage: 'Source checkout', expectedTeam: 'Azure DevOps - Repos' },
      { failureStage: 'Test execution', expectedTeam: 'Azure DevOps - Test Plans' },
      { failureStage: 'Artifact handling', expectedTeam: 'Azure DevOps - Artifacts' },
      { failureStage: 'Build/Compilation', expectedTeam: 'Azure DevOps - Pipelines' }
    ];

    testCases.forEach(testCase => {
      const failureData: PipelineFailureData = {
        organizationName: 'test',
        failureType: 'Code/compilation error',
        failureStage: testCase.failureStage,
        affectedUsers: 10,
        impactLevel: 'Low - Minor issues',
        errorMessages: [],
        troubleshootingSteps: []
      };

      const icmReport = generator.generateICMReport(failureData);
      expect(icmReport.owningTeam).toBe(testCase.expectedTeam);
    });
  });

  it('should convert troubleshooting steps to mitigation actions', () => {
    const failureData: PipelineFailureData = {
      organizationName: 'contoso',
      failureType: 'Configuration error',
      failureStage: 'Queue/Scheduling',
      affectedUsers: 25,
      impactLevel: 'Medium - Some functionality affected',
      errorMessages: [],
      troubleshootingSteps: [
        {
          step: 'Checked pipeline configuration',
          result: 'Found misconfigured variable',
          timestamp: '2025-08-06T11:00:00Z',
          performedBy: 'DevOps Engineer'
        },
        {
          step: 'Updated pipeline variable',
          result: 'Successfully updated configuration',
          timestamp: '2025-08-06T11:30:00Z',
          performedBy: 'DevOps Engineer'
        }
      ]
    };

    const icmReport = generator.generateICMReport(failureData);

    expect(icmReport.mitigationActions).toHaveLength(2);
    expect(icmReport.mitigationActions[0].action).toBe('Checked pipeline configuration');
    expect(icmReport.mitigationActions[0].timestamp).toBe('2025-08-06T11:00:00Z');
    expect(icmReport.mitigationActions[0].performedBy).toBe('DevOps Engineer');
    expect(icmReport.mitigationActions[0].effectiveness).toBe('Not effective');

    expect(icmReport.mitigationActions[1].effectiveness).toBe('Effective');
  });
});
