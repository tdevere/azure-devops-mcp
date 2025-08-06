// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// ICM Report Generator for Azure DevOps Pipeline Failures
// Generates Incident Management reports based on pipeline failure data

import * as fs from 'fs';
import * as path from 'path';

export interface ICMReportData {
  incidentSummary: string;
  incidentDescription: string;
  severity: 'Sev1' | 'Sev2' | 'Sev3' | 'Sev4';
  owningTeam: string;
  rootCauseCategory?: string;
  mitigationActions: {
    action: string;
    timestamp: string;
    performedBy: string;
    effectiveness?: string;
  }[];
  communicationPlan: {
    customerNotification: boolean;
    internalNotification: boolean;
    escalationRequired?: boolean;
    publicStatusPage?: boolean;
  };
}

export interface PipelineFailureData {
  organizationName: string;
  failureType: string;
  failureStage: string;
  affectedUsers: number;
  impactLevel: string;
  errorMessages: string[];
  troubleshootingSteps: {
    step: string;
    result?: string;
    timestamp?: string;
    performedBy?: string;
  }[];
}

interface TemplateData {
  icmIntegration?: {
    severityMapping?: Record<string, string>;
  };
  integrations?: {
    icmIntegration?: {
      requiredForCreation?: string[];
    };
  };
}

export class ICMReportGenerator {
  private template!: TemplateData;

  constructor() {
    this.loadTemplate();
  }

  private loadTemplate(): void {
    const templatePath = path.join(__dirname, '../../templates/pipeline-troubleshooting-template.json');
    try {
      const templateData = fs.readFileSync(templatePath, 'utf8');
      this.template = JSON.parse(templateData) as TemplateData;
    } catch (error) {
      throw new Error(`Failed to load ICM template: ${error}`);
    }
  }

  /**
   * Generate an ICM report from pipeline failure data
   */
  public generateICMReport(failureData: PipelineFailureData): ICMReportData {
    const severity = this.mapImpactToSeverity(failureData.impactLevel);
    const owningTeam = this.determineOwningTeam(failureData.failureType, failureData.failureStage);

    const incidentSummary = this.generateIncidentSummary(failureData);
    const incidentDescription = this.generateIncidentDescription(failureData);

    return {
      incidentSummary,
      incidentDescription,
      severity,
      owningTeam,
      rootCauseCategory: this.categorizeRootCause(failureData.failureType),
      mitigationActions: this.convertTroubleshootingToMitigation(failureData.troubleshootingSteps),
      communicationPlan: this.determineCommunicationPlan(severity, failureData.affectedUsers)
    };
  }

  /**
   * Generate incident summary using template
   */
  private generateIncidentSummary(data: PipelineFailureData): string {
    const template = "Pipeline failure in {{organizationName}}: {{failureType}} affecting {{affectedUsers}} users";
    return template
      .replace('{{organizationName}}', data.organizationName)
      .replace('{{failureType}}', data.failureType)
      .replace('{{affectedUsers}}', data.affectedUsers.toString());
  }

  /**
   * Generate detailed incident description
   */
  private generateIncidentDescription(data: PipelineFailureData): string {
    const troubleshootingText = data.troubleshootingSteps
      .map(step => `- ${step.step}${step.result ? `: ${step.result}` : ''}`)
      .join('\n');

    const errorText = data.errorMessages.length > 0
      ? data.errorMessages.map(err => `- ${err}`).join('\n')
      : 'No specific error messages captured';

    return `Pipeline failures detected in organization ${data.organizationName}.

Failure Details:
- Stage: ${data.failureStage}
- Type: ${data.failureType}
- Impact Level: ${data.impactLevel}
- Affected Users: ${data.affectedUsers}

Error Messages:
${errorText}

Troubleshooting performed:
${troubleshootingText}`;
  }

  /**
   * Map impact level to ICM severity
   */
  private mapImpactToSeverity(impactLevel: string): 'Sev1' | 'Sev2' | 'Sev3' | 'Sev4' {
    switch (impactLevel) {
      case 'Critical - Complete service down':
        return 'Sev1';
      case 'High - Major functionality impaired':
        return 'Sev2';
      case 'Medium - Some functionality affected':
        return 'Sev3';
      case 'Low - Minor issues':
        return 'Sev4';
      default:
        return 'Sev3';
    }
  }

  /**
   * Determine owning team based on failure type and stage
   */
  private determineOwningTeam(failureType: string, failureStage: string): string {
    // Infrastructure and agent-related issues
    if (failureType === 'Infrastructure failure' || failureStage === 'Agent allocation') {
      return 'Azure DevOps - Platform';
    }

    // Build and pipeline-specific issues
    if (failureStage === 'Build/Compilation' || failureStage === 'Source checkout') {
      return 'Azure DevOps - Pipelines';
    }

    // Repository-related issues
    if (failureStage === 'Source checkout') {
      return 'Azure DevOps - Repos';
    }

    // Test-related issues
    if (failureStage === 'Test execution') {
      return 'Azure DevOps - Test Plans';
    }

    // Artifact-related issues
    if (failureStage === 'Artifact handling') {
      return 'Azure DevOps - Artifacts';
    }

    // Default to Pipelines team
    return 'Azure DevOps - Pipelines';
  }

  /**
   * Categorize root cause based on failure type
   */
  private categorizeRootCause(failureType: string): string {
    const mapping: Record<string, string> = {
      'Infrastructure failure': 'Infrastructure failure',
      'Code/compilation error': 'Code defect',
      'Configuration error': 'Configuration error',
      'Network/connectivity issue': 'Infrastructure failure',
      'Permission/authentication error': 'Configuration error',
      'Resource constraint': 'Capacity issue',
      'External dependency failure': 'External dependency',
      'Timeout': 'Infrastructure failure'
    };

    return mapping[failureType] || 'Under investigation';
  }

  /**
   * Convert troubleshooting steps to mitigation actions
   */
  private convertTroubleshootingToMitigation(steps: {
    step: string;
    result?: string;
    timestamp?: string;
    performedBy?: string;
  }[]): {
    action: string;
    timestamp: string;
    performedBy: string;
    effectiveness?: string;
  }[] {
    return steps.map(step => ({
      action: step.step,
      timestamp: step.timestamp || new Date().toISOString(),
      performedBy: step.performedBy || 'Support Engineer',
      effectiveness: step.result ? (step.result.includes('success') ? 'Effective' : 'Not effective') : 'Unknown'
    }));
  }

  /**
   * Determine communication plan based on severity and impact
   */
  private determineCommunicationPlan(severity: string, affectedUsers: number): {
    customerNotification: boolean;
    internalNotification: boolean;
    escalationRequired?: boolean;
    publicStatusPage?: boolean;
  } {
    const isCritical = severity === 'Sev1';
    const isHighImpact = affectedUsers > 100;

    return {
      customerNotification: isCritical || isHighImpact,
      internalNotification: true,
      escalationRequired: isCritical,
      publicStatusPage: isCritical && affectedUsers > 1000
    };
  }

  /**
   * Export ICM report to JSON format
   */
  public exportReport(reportData: ICMReportData, outputPath: string): void {
    const reportJson = JSON.stringify(reportData, null, 2);
    fs.writeFileSync(outputPath, reportJson, 'utf8');
  }

  /**
   * Validate that all required fields are present for ICM creation
   */
  public validateForICMCreation(reportData: ICMReportData): { valid: boolean; missingFields: string[] } {
    const requiredFields = this.template.integrations?.icmIntegration?.requiredForCreation || [];
    const missingFields: string[] = [];

    requiredFields.forEach((field: string) => {
      if (!reportData[field as keyof ICMReportData]) {
        missingFields.push(field);
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  }
}

// Example usage
export function createICMReportFromFailure(failureData: PipelineFailureData): ICMReportData {
  const generator = new ICMReportGenerator();
  return generator.generateICMReport(failureData);
}
