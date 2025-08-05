// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export var FailureType;
(function (FailureType) {
    FailureType["TaskFailure"] = "task_failure";
    FailureType["InfrastructureFailure"] = "infrastructure_failure";
    FailureType["DependencyFailure"] = "dependency_failure";
    FailureType["ConfigurationIssue"] = "configuration_issue";
    FailureType["SourceCodeIssue"] = "source_code_issue";
    FailureType["TestFailure"] = "test_failure";
    FailureType["TimeoutFailure"] = "timeout_failure";
    FailureType["ResourceExhaustion"] = "resource_exhaustion";
    FailureType["NetworkIssue"] = "network_issue";
    FailureType["AuthenticationFailure"] = "authentication_failure";
    FailureType["Unknown"] = "unknown";
})(FailureType || (FailureType = {}));
export var FailureCategory;
(function (FailureCategory) {
    FailureCategory["Transient"] = "transient";
    FailureCategory["Persistent"] = "persistent";
    FailureCategory["Environmental"] = "environmental";
    FailureCategory["Systematic"] = "systematic"; // Pattern across multiple builds
})(FailureCategory || (FailureCategory = {}));
export var TaskErrorType;
(function (TaskErrorType) {
    TaskErrorType["ExecutionFailure"] = "execution_failure";
    TaskErrorType["ValidationFailure"] = "validation_failure";
    TaskErrorType["ConfigurationError"] = "configuration_error";
    TaskErrorType["DependencyMissing"] = "dependency_missing";
    TaskErrorType["PermissionDenied"] = "permission_denied";
    TaskErrorType["ResourceUnavailable"] = "resource_unavailable";
    TaskErrorType["TimeoutError"] = "timeout_error";
    TaskErrorType["NetworkError"] = "network_error";
    TaskErrorType["UnknownError"] = "unknown_error";
})(TaskErrorType || (TaskErrorType = {}));
export var BuildPhase;
(function (BuildPhase) {
    BuildPhase["Initialization"] = "initialization";
    BuildPhase["SourceDownload"] = "source_download";
    BuildPhase["PreBuild"] = "pre_build";
    BuildPhase["Build"] = "build";
    BuildPhase["Test"] = "test";
    BuildPhase["PostBuild"] = "post_build";
    BuildPhase["Deploy"] = "deploy";
    BuildPhase["Cleanup"] = "cleanup";
    BuildPhase["Finalization"] = "finalization";
})(BuildPhase || (BuildPhase = {}));
export var RecommendationCategory;
(function (RecommendationCategory) {
    RecommendationCategory["ImmediateFix"] = "immediate_fix";
    RecommendationCategory["CodeChange"] = "code_change";
    RecommendationCategory["ConfigurationUpdate"] = "configuration_update";
    RecommendationCategory["InfrastructureImprovement"] = "infrastructure_improvement";
    RecommendationCategory["ProcessImprovement"] = "process_improvement";
    RecommendationCategory["Monitoring"] = "monitoring";
})(RecommendationCategory || (RecommendationCategory = {}));
