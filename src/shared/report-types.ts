// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Shared types for build failure reporting and analysis
 */

export interface BuildFailureReport {
  metadata: ReportMetadata;
  summary: FailureSummary;
  rootCauseAnalysis: RootCauseAnalysis;
  taskAnalysis: TaskFailureAnalysis[];
  diffAnalysis?: BuildDiffAnalysis;
  environmentContext: EnvironmentContext;
  timeline: FailureTimeline[];
  recommendations: IntelligentRecommendation[];
  relatedIssues: RelatedIssue[];
  attachments: ReportAttachment[];
}

export interface ReportMetadata {
  reportId: string;
  generatedAt: Date;
  project: string;
  buildId: number;
  buildNumber: string;
  definitionName: string;
  branch: string;
  repository: string;
  requestedBy: string;
  queueTime: Date;
  startTime?: Date;
  finishTime?: Date;
  duration?: number; // in seconds
  result: string;
  reason: string;
}

export interface FailureSummary {
  primaryFailureType: FailureType;
  failureCategory: FailureCategory;
  confidenceScore: number; // 0-1, how confident we are in the analysis
  quickSummary: string;
  impactAssessment: ImpactAssessment;
  isRecurrentFailure: boolean;
  failureFrequency?: FailureFrequency;
}

export enum FailureType {
  TaskFailure = "task_failure",
  InfrastructureFailure = "infrastructure_failure",
  DependencyFailure = "dependency_failure",
  ConfigurationIssue = "configuration_issue",
  SourceCodeIssue = "source_code_issue",
  TestFailure = "test_failure",
  TimeoutFailure = "timeout_failure",
  ResourceExhaustion = "resource_exhaustion",
  NetworkIssue = "network_issue",
  AuthenticationFailure = "authentication_failure",
  Unknown = "unknown"
}

export enum FailureCategory {
  Transient = "transient", // Likely to succeed on retry
  Persistent = "persistent", // Requires code/config changes
  Environmental = "environmental", // Infrastructure/agent issue
  Systematic = "systematic" // Pattern across multiple builds
}

export interface ImpactAssessment {
  affectedBranches: string[];
  blockingDeployment: boolean;
  customerImpact: "none" | "low" | "medium" | "high" | "critical";
  estimatedResolutionTime: string;
}

export interface FailureFrequency {
  occurrencesLast24h: number;
  occurrencesLast7d: number;
  occurrencesLast30d: number;
  firstOccurrence?: Date;
  patternDetected: boolean;
}

export interface RootCauseAnalysis {
  primaryCause: string;
  contributingFactors: string[];
  failureStack: FailureStackEntry[];
  errorClassification: ErrorClassification;
  isKnownIssue: boolean;
  knownIssueUrl?: string;
}

export interface FailureStackEntry {
  level: number;
  component: string;
  errorMessage: string;
  errorCode?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ErrorClassification {
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  actionRequired: "none" | "monitoring" | "investigation" | "immediate_action";
  automatedResolution: boolean;
}

export interface TaskFailureAnalysis {
  taskId: string;
  taskName: string;
  taskType: string;
  displayName: string;
  order: number;
  state: string;
  result: string;
  startTime?: Date;
  finishTime?: Date;
  duration?: number;
  errorDetails: TaskErrorDetails;
  logs: TaskLogEntry[];
  environmentVariables: Record<string, string>;
  inputs: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

export interface TaskErrorDetails {
  errorMessage: string;
  errorCode?: string;
  exitCode?: number;
  errorType: TaskErrorType;
  stackTrace?: string;
  innerErrors: string[];
  recoveryHints: string[];
}

export enum TaskErrorType {
  ExecutionFailure = "execution_failure",
  ValidationFailure = "validation_failure",
  ConfigurationError = "configuration_error",
  DependencyMissing = "dependency_missing",
  PermissionDenied = "permission_denied",
  ResourceUnavailable = "resource_unavailable",
  TimeoutError = "timeout_error",
  NetworkError = "network_error",
  UnknownError = "unknown_error"
}

export interface TaskLogEntry {
  timestamp: Date;
  level: "debug" | "info" | "warning" | "error";
  message: string;
  source?: string;
}

export interface BuildDiffAnalysis {
  lastSuccessfulBuild: BuildReference;
  comparison: BuildComparison;
  significantChanges: SourceChange[];
  riskAssessment: RiskAssessment;
}

export interface BuildReference {
  buildId: number;
  buildNumber: string;
  finishTime: Date;
  result: string;
  sourceVersion: string;
  branch: string;
}

export interface BuildComparison {
  sourceChanges: SourceChange[];
  configurationChanges: ConfigurationChange[];
  dependencyChanges: DependencyChange[];
  environmentChanges: EnvironmentChange[];
  timingDifferences: TimingDifference[];
}

export interface SourceChange {
  type: "added" | "modified" | "deleted" | "renamed";
  path: string;
  changeType: "code" | "config" | "test" | "documentation";
  linesAdded?: number;
  linesRemoved?: number;
  author: string;
  commitId: string;
  commitMessage: string;
  riskLevel: "low" | "medium" | "high";
}

export interface ConfigurationChange {
  type: "pipeline" | "build_definition" | "variables" | "triggers";
  property: string;
  oldValue?: string;
  newValue?: string;
  impact: "low" | "medium" | "high";
}

export interface DependencyChange {
  type: "package" | "tool" | "service";
  name: string;
  oldVersion?: string;
  newVersion?: string;
  changeType: "added" | "updated" | "removed";
  breakingChange: boolean;
}

export interface EnvironmentChange {
  type: "agent" | "pool" | "runtime" | "system";
  property: string;
  oldValue?: string;
  newValue?: string;
  impact: "low" | "medium" | "high";
}

export interface TimingDifference {
  phase: string;
  currentDuration: number;
  previousDuration: number;
  difference: number;
  percentageChange: number;
  significance: "minor" | "moderate" | "major";
}

export interface RiskAssessment {
  overallRisk: "low" | "medium" | "high";
  riskFactors: string[];
  likelyRootCause?: string;
  recommendedActions: string[];
}

export interface EnvironmentContext {
  agent: AgentInfo;
  system: SystemInfo;
  runtime: RuntimeInfo;
  dependencies: DependencyInfo[];
  resourceUsage: ResourceUsage;
}

export interface AgentInfo {
  name: string;
  version: string;
  pool: string;
  capabilities: Record<string, string>;
  osType: string;
  architecture: string;
  diskSpace: number;
  memoryTotal: number;
}

export interface SystemInfo {
  osVersion: string;
  framework: string;
  timezone: string;
  locale: string;
  environmentVariables: Record<string, string>;
}

export interface RuntimeInfo {
  nodeVersion?: string;
  npmVersion?: string;
  pythonVersion?: string;
  javaVersion?: string;
  dotnetVersion?: string;
  dockerVersion?: string;
  gitVersion?: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  type: "runtime" | "build_tool" | "package" | "service";
  status: "available" | "missing" | "incompatible" | "outdated";
}

export interface ResourceUsage {
  peakMemoryUsage: number;
  peakCpuUsage: number;
  diskUsage: number;
  networkUsage: number;
  duration: number;
}

export interface FailureTimeline {
  timestamp: Date;
  event: string;
  phase: BuildPhase;
  status: "started" | "completed" | "failed" | "warning";
  duration?: number;
  details?: string;
  logReference?: string;
}

export enum BuildPhase {
  Initialization = "initialization",
  SourceDownload = "source_download",
  PreBuild = "pre_build",
  Build = "build",
  Test = "test",
  PostBuild = "post_build",
  Deploy = "deploy",
  Cleanup = "cleanup",
  Finalization = "finalization"
}

export interface IntelligentRecommendation {
  id: string;
  priority: "low" | "medium" | "high" | "critical";
  category: RecommendationCategory;
  title: string;
  description: string;
  action: string;
  estimatedTime: string;
  automationAvailable: boolean;
  relatedLinks: string[];
  confidence: number; // 0-1
}

export enum RecommendationCategory {
  ImmediateFix = "immediate_fix",
  CodeChange = "code_change",
  ConfigurationUpdate = "configuration_update",
  InfrastructureImprovement = "infrastructure_improvement",
  ProcessImprovement = "process_improvement",
  Monitoring = "monitoring"
}

export interface RelatedIssue {
  buildId: number;
  buildNumber: string;
  finishTime: Date;
  similarity: number; // 0-1
  similarityReason: string;
  resolution?: string;
  timeSinceOccurrence: string;
}

export interface ReportAttachment {
  type: "log" | "screenshot" | "config" | "diff" | "timeline" | "metrics";
  name: string;
  description: string;
  content: string;
  mimeType: string;
  size: number;
}

export interface FailureReportOptions {
  includeFullLogs: boolean;
  includeDiffAnalysis: boolean;
  includeEnvironmentDetails: boolean;
  includeRelatedIssues: boolean;
  maxRelatedIssues: number;
  analyzeTimeWindow: number; // days
  confidenceThreshold: number; // 0-1
}
