// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { BuildResult, BuildQueryOrder, TaskResult } from "azure-devops-node-api/interfaces/BuildInterfaces.js";
import { FailureType, FailureCategory, TaskErrorType, RecommendationCategory, BuildPhase } from "../shared/report-types.js";
export class BuildFailureReportGenerator {
    connection;
    project;
    constructor(connection, project) {
        this.connection = connection;
        this.project = project;
    }
    /**
     * Generates a comprehensive failure report for a specific build
     */
    async generateReport(buildId, options = {}) {
        const defaultOptions = {
            includeFullLogs: true,
            includeDiffAnalysis: true,
            includeEnvironmentDetails: true,
            includeRelatedIssues: true,
            maxRelatedIssues: 10,
            analyzeTimeWindow: 30,
            confidenceThreshold: 0.7,
            ...options
        };
        const buildApi = await this.connection.getBuildApi();
        const build = await buildApi.getBuild(this.project, buildId);
        if (!build) {
            throw new Error(`Build ${buildId} not found`);
        }
        const reportId = `failure-report-${buildId}-${Date.now()}`;
        // Generate all sections of the report
        const [summary, rootCauseAnalysis, taskAnalysis, diffAnalysis, environmentContext, timeline, recommendations, relatedIssues, attachments] = await Promise.all([
            this.generateFailureSummary(build, defaultOptions),
            this.generateRootCauseAnalysis(build, defaultOptions),
            this.generateTaskAnalysis(build, defaultOptions),
            defaultOptions.includeDiffAnalysis ? this.generateDiffAnalysis(build, defaultOptions) : Promise.resolve(undefined),
            defaultOptions.includeEnvironmentDetails ? this.generateEnvironmentContext(build, defaultOptions) : Promise.resolve({}),
            this.generateFailureTimeline(build, defaultOptions),
            this.generateRecommendations(build, defaultOptions),
            defaultOptions.includeRelatedIssues ? this.generateRelatedIssues(build, defaultOptions) : Promise.resolve([]),
            this.generateAttachments(build, defaultOptions)
        ]);
        const report = {
            metadata: {
                reportId,
                generatedAt: new Date(),
                project: this.project,
                buildId: build.id,
                buildNumber: build.buildNumber || "Unknown",
                definitionName: build.definition?.name || "Unknown",
                branch: build.sourceBranch || "Unknown",
                repository: build.repository?.name || "Unknown",
                requestedBy: build.requestedBy?.displayName || "Unknown",
                queueTime: build.queueTime || new Date(),
                startTime: build.startTime,
                finishTime: build.finishTime,
                duration: build.finishTime && build.startTime ?
                    Math.round((build.finishTime.getTime() - build.startTime.getTime()) / 1000) : undefined,
                result: this.getBuildResultString(build.result),
                reason: this.getBuildReasonString(build.reason)
            },
            summary,
            rootCauseAnalysis,
            taskAnalysis,
            diffAnalysis,
            environmentContext,
            timeline,
            recommendations,
            relatedIssues,
            attachments
        };
        return report;
    }
    async generateFailureSummary(build, options) {
        const buildApi = await this.connection.getBuildApi();
        // Analyze failure pattern
        const timeline = await this.getTimelineRecords(build);
        const failureType = this.analyzeFailureType(timeline);
        const failureCategory = this.analyzeFailureCategory(build, timeline);
        // Check for recurrent failures
        const recentBuilds = await buildApi.getBuilds(this.project, [build.definition?.id], undefined, undefined, new Date(Date.now() - options.analyzeTimeWindow * 24 * 60 * 60 * 1000), undefined, undefined, undefined, undefined, BuildResult.Failed | BuildResult.PartiallySucceeded, undefined, undefined, 50);
        const failureFrequency = this.analyzeFailureFrequency(recentBuilds);
        return {
            primaryFailureType: failureType,
            failureCategory,
            confidenceScore: this.calculateConfidenceScore(timeline, failureType),
            quickSummary: this.generateQuickSummary(build, timeline, failureType),
            impactAssessment: await this.generateImpactAssessment(build),
            isRecurrentFailure: failureFrequency.occurrencesLast7d > 2,
            failureFrequency
        };
    }
    async generateRootCauseAnalysis(build, options) {
        const timeline = await this.getTimelineRecords(build);
        const failedTasks = timeline.filter(t => t.result === TaskResult.Failed);
        const primaryCause = this.identifyPrimaryCause(failedTasks);
        const contributingFactors = this.identifyContributingFactors(timeline, failedTasks);
        const failureStack = this.buildFailureStack(failedTasks);
        return {
            primaryCause,
            contributingFactors,
            failureStack,
            errorClassification: this.classifyError(failedTasks),
            isKnownIssue: false, // TODO: Implement known issue detection
            knownIssueUrl: undefined
        };
    }
    async generateTaskAnalysis(build, options) {
        const timeline = await this.getTimelineRecords(build);
        const failedTasks = timeline.filter(t => t.result === TaskResult.Failed);
        const taskAnalyses = [];
        for (const task of failedTasks) {
            const logs = options.includeFullLogs ? await this.getTaskLogs(build, task) : [];
            const errorDetails = this.analyzeTaskError(task, logs);
            taskAnalyses.push({
                taskId: task.id || "unknown",
                taskName: task.name || "Unknown Task",
                taskType: task.type || "Unknown",
                displayName: task.task?.name || task.name || "Unknown",
                order: task.order || 0,
                state: this.getTaskStateString(task.state),
                result: this.getTaskResultString(task.result),
                startTime: task.startTime,
                finishTime: task.finishTime,
                duration: task.finishTime && task.startTime ?
                    Math.round((task.finishTime.getTime() - task.startTime.getTime()) / 1000) : undefined,
                errorDetails,
                logs,
                environmentVariables: this.extractEnvironmentVariables(task),
                inputs: this.extractTaskInputs(task),
                outputs: this.extractTaskOutputs(task)
            });
        }
        return taskAnalyses;
    }
    async generateDiffAnalysis(build, options) {
        try {
            const buildApi = await this.connection.getBuildApi();
            // Find last successful build
            const successfulBuilds = await buildApi.getBuilds(this.project, [build.definition?.id], undefined, undefined, undefined, build.queueTime, undefined, undefined, undefined, BuildResult.Succeeded, undefined, undefined, 1, undefined, undefined, undefined, BuildQueryOrder.QueueTimeDescending);
            if (successfulBuilds.length === 0) {
                return undefined;
            }
            const lastSuccessfulBuild = successfulBuilds[0];
            const comparison = await this.compareBuilds(build, lastSuccessfulBuild);
            const riskAssessment = this.assessRisk(comparison);
            return {
                lastSuccessfulBuild: {
                    buildId: lastSuccessfulBuild.id,
                    buildNumber: lastSuccessfulBuild.buildNumber || "Unknown",
                    finishTime: lastSuccessfulBuild.finishTime || new Date(),
                    result: this.getBuildResultString(lastSuccessfulBuild.result),
                    sourceVersion: lastSuccessfulBuild.sourceVersion || "Unknown",
                    branch: lastSuccessfulBuild.sourceBranch || "Unknown"
                },
                comparison,
                significantChanges: comparison.sourceChanges.filter(c => c.riskLevel === "high"),
                riskAssessment
            };
        }
        catch (error) {
            console.warn("Failed to generate diff analysis:", error);
            return undefined;
        }
    }
    async generateEnvironmentContext(build, options) {
        // This would require additional API calls to get agent and system information
        // For now, return a basic structure with available information
        return {
            agent: {
                name: "Unknown",
                version: "Unknown",
                pool: "Unknown",
                capabilities: {},
                osType: "Unknown",
                architecture: "Unknown",
                diskSpace: 0,
                memoryTotal: 0
            },
            system: {
                osVersion: "Unknown",
                framework: "Unknown",
                timezone: "Unknown",
                locale: "Unknown",
                environmentVariables: {}
            },
            runtime: {},
            dependencies: [],
            resourceUsage: {
                peakMemoryUsage: 0,
                peakCpuUsage: 0,
                diskUsage: 0,
                networkUsage: 0,
                duration: build.finishTime && build.startTime ?
                    Math.round((build.finishTime.getTime() - build.startTime.getTime()) / 1000) : 0
            }
        };
    }
    async generateFailureTimeline(build, options) {
        const timeline = await this.getTimelineRecords(build);
        return timeline
            .filter(record => record.startTime)
            .sort((a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0))
            .map(record => ({
            timestamp: record.startTime,
            event: record.name || "Unknown Event",
            phase: this.mapToPhase(record.type || ""),
            status: this.getTimelineStatus(record),
            duration: record.finishTime && record.startTime ?
                Math.round((record.finishTime.getTime() - record.startTime.getTime()) / 1000) : undefined,
            details: record.errorCount && record.errorCount > 0 ?
                `${record.errorCount} error(s), ${record.warningCount || 0} warning(s)` : undefined,
            logReference: record.log?.url
        }));
    }
    async generateRecommendations(build, options) {
        const timeline = await this.getTimelineRecords(build);
        const failedTasks = timeline.filter(t => t.result === TaskResult.Failed);
        const recommendations = [];
        for (const task of failedTasks) {
            const taskRecommendations = this.generateTaskRecommendations(task);
            recommendations.push(...taskRecommendations);
        }
        // Add general recommendations based on failure patterns
        recommendations.push(...this.generateGeneralRecommendations(build, timeline));
        return recommendations.sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority));
    }
    async generateRelatedIssues(build, options) {
        const buildApi = await this.connection.getBuildApi();
        // Get recent failed builds from the same definition
        const recentFailures = await buildApi.getBuilds(this.project, [build.definition?.id], undefined, undefined, new Date(Date.now() - options.analyzeTimeWindow * 24 * 60 * 60 * 1000), undefined, undefined, undefined, undefined, BuildResult.Failed | BuildResult.PartiallySucceeded, undefined, undefined, options.maxRelatedIssues * 2 // Get more to filter
        );
        const relatedIssues = [];
        for (const failedBuild of recentFailures) {
            if (failedBuild.id === build.id)
                continue;
            const similarity = await this.calculateSimilarity(build, failedBuild);
            if (similarity >= options.confidenceThreshold) {
                relatedIssues.push({
                    buildId: failedBuild.id,
                    buildNumber: failedBuild.buildNumber || "Unknown",
                    finishTime: failedBuild.finishTime || new Date(),
                    similarity,
                    similarityReason: this.getSimilarityReason(similarity),
                    timeSinceOccurrence: this.getTimeSince(failedBuild.finishTime || new Date())
                });
            }
        }
        return relatedIssues
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, options.maxRelatedIssues);
    }
    async generateAttachments(build, options) {
        const attachments = [];
        if (options.includeFullLogs) {
            try {
                const buildApi = await this.connection.getBuildApi();
                const logs = await buildApi.getBuildLogs(this.project, build.id);
                for (const log of logs) {
                    if (log.type === 'container' && log.url) {
                        const logContent = await this.fetchLogContent(log.url);
                        attachments.push({
                            type: "log",
                            name: `build-log-${log.id}.txt`,
                            description: `Build log for ${log.type}`,
                            content: logContent,
                            mimeType: "text/plain",
                            size: logContent.length
                        });
                    }
                }
            }
            catch (error) {
                console.warn("Failed to fetch build logs:", error);
            }
        }
        return attachments;
    }
    // Helper methods for analysis
    async getTimelineRecords(build) {
        try {
            const buildApi = await this.connection.getBuildApi();
            const timeline = await buildApi.getBuildTimeline(this.project, build.id);
            return timeline?.records || [];
        }
        catch (error) {
            console.warn("Failed to get timeline records:", error);
            return [];
        }
    }
    analyzeFailureType(timeline) {
        const failedTasks = timeline.filter(t => t.result === TaskResult.Failed);
        if (failedTasks.length === 0) {
            return FailureType.Unknown;
        }
        // Analyze task names and error patterns to determine failure type
        for (const task of failedTasks) {
            const taskName = (task.name || "").toLowerCase();
            const issues = task.issues || [];
            if (taskName.includes("test") || taskName.includes("unit") || taskName.includes("integration")) {
                return FailureType.TestFailure;
            }
            if (taskName.includes("build") || taskName.includes("compile")) {
                return FailureType.SourceCodeIssue;
            }
            if (issues.some(issue => issue.message?.toLowerCase().includes("timeout"))) {
                return FailureType.TimeoutFailure;
            }
            if (issues.some(issue => issue.message?.toLowerCase().includes("network") || issue.message?.toLowerCase().includes("connection"))) {
                return FailureType.NetworkIssue;
            }
        }
        return FailureType.TaskFailure;
    }
    analyzeFailureCategory(build, timeline) {
        // Implement logic to categorize failures as transient, persistent, environmental, or systematic
        // This is a simplified version
        return FailureCategory.Persistent;
    }
    analyzeFailureFrequency(recentBuilds) {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
            occurrencesLast24h: recentBuilds.filter(b => b.finishTime && b.finishTime > last24h).length,
            occurrencesLast7d: recentBuilds.filter(b => b.finishTime && b.finishTime > last7d).length,
            occurrencesLast30d: recentBuilds.filter(b => b.finishTime && b.finishTime > last30d).length,
            firstOccurrence: recentBuilds.length > 0 ? recentBuilds[recentBuilds.length - 1].finishTime : undefined,
            patternDetected: recentBuilds.length > 3
        };
    }
    calculateConfidenceScore(timeline, failureType) {
        // Simple confidence calculation based on available data
        const failedTasks = timeline.filter(t => t.result === TaskResult.Failed);
        if (failedTasks.length === 0)
            return 0.5;
        const hasDetailedErrors = failedTasks.some(t => t.issues && t.issues.length > 0);
        return hasDetailedErrors ? 0.8 : 0.6;
    }
    generateQuickSummary(build, timeline, failureType) {
        const failedTasks = timeline.filter(t => t.result === TaskResult.Failed);
        const taskCount = failedTasks.length;
        if (taskCount === 0) {
            return "Build failed with no specific task failures identified.";
        }
        const firstFailedTask = failedTasks[0];
        return `Build failed with ${taskCount} task failure(s). Primary failure in '${firstFailedTask.name}' (${failureType}).`;
    }
    async generateImpactAssessment(build) {
        return {
            affectedBranches: [build.sourceBranch || "Unknown"],
            blockingDeployment: true, // Conservative assumption
            customerImpact: "medium", // Default assessment
            estimatedResolutionTime: "2-4 hours" // Default estimate
        };
    }
    // Additional helper methods would be implemented here...
    identifyPrimaryCause(failedTasks) {
        if (failedTasks.length === 0)
            return "Unknown failure cause";
        return `Task '${failedTasks[0].name}' failed`;
    }
    identifyContributingFactors(timeline, failedTasks) {
        const factors = [];
        if (timeline.some(t => t.warningCount && t.warningCount > 0)) {
            factors.push("Build warnings present");
        }
        return factors;
    }
    buildFailureStack(failedTasks) {
        return failedTasks.map((task, index) => ({
            level: index,
            component: task.name || "Unknown Task",
            errorMessage: task.issues?.[0]?.message || "No error message available",
            errorCode: task.issues?.[0]?.type?.toString(),
            timestamp: task.startTime || new Date(),
            context: {
                taskType: task.type,
                state: task.state,
                result: task.result
            }
        }));
    }
    classifyError(failedTasks) {
        return {
            category: "Build Failure",
            severity: "high",
            actionRequired: "investigation",
            automatedResolution: false
        };
    }
    async getTaskLogs(build, task) {
        // This would fetch actual task logs and parse them
        // For now, return a placeholder
        return [];
    }
    analyzeTaskError(task, logs) {
        const issues = task.issues || [];
        const primaryIssue = issues[0];
        return {
            errorMessage: primaryIssue?.message || "No error message available",
            errorCode: primaryIssue?.type?.toString(),
            errorType: TaskErrorType.ExecutionFailure,
            innerErrors: issues.slice(1).map(i => i.message || ""),
            recoveryHints: this.generateRecoveryHints(task)
        };
    }
    generateRecoveryHints(task) {
        const hints = [];
        const taskName = (task.name || "").toLowerCase();
        if (taskName.includes("test")) {
            hints.push("Check test logs for specific test failures");
            hints.push("Verify test dependencies are available");
        }
        if (taskName.includes("build")) {
            hints.push("Check for compilation errors in the source code");
            hints.push("Verify all dependencies are properly installed");
        }
        return hints;
    }
    extractEnvironmentVariables(task) {
        // Extract environment variables from task if available
        return {};
    }
    extractTaskInputs(task) {
        // Extract task inputs if available
        return {};
    }
    extractTaskOutputs(task) {
        // Extract task outputs if available
        return {};
    }
    async compareBuilds(currentBuild, lastSuccessfulBuild) {
        // This would implement detailed build comparison
        // For now, return a basic structure
        return {
            sourceChanges: [],
            configurationChanges: [],
            dependencyChanges: [],
            environmentChanges: [],
            timingDifferences: []
        };
    }
    assessRisk(comparison) {
        return {
            overallRisk: "medium",
            riskFactors: ["Source code changes detected"],
            recommendedActions: ["Review recent code changes", "Check for breaking changes"]
        };
    }
    mapToPhase(recordType) {
        const type = recordType.toLowerCase();
        if (type.includes("checkout") || type.includes("source"))
            return BuildPhase.SourceDownload;
        if (type.includes("build") || type.includes("compile"))
            return BuildPhase.Build;
        if (type.includes("test"))
            return BuildPhase.Test;
        if (type.includes("deploy"))
            return BuildPhase.Deploy;
        if (type.includes("job"))
            return BuildPhase.Initialization;
        return BuildPhase.Build;
    }
    getTimelineStatus(record) {
        if (record.result === TaskResult.Failed)
            return "failed";
        if (record.result === TaskResult.Succeeded)
            return "completed";
        if (record.warningCount && record.warningCount > 0)
            return "warning";
        return "started";
    }
    generateTaskRecommendations(task) {
        const recommendations = [];
        const taskName = (task.name || "").toLowerCase();
        if (taskName.includes("test")) {
            recommendations.push({
                id: `test-failure-${task.id}`,
                priority: "high",
                category: RecommendationCategory.ImmediateFix,
                title: "Investigate Test Failures",
                description: "Review failed test cases and their error messages",
                action: "Examine test logs and fix failing test cases",
                estimatedTime: "30-60 minutes",
                automationAvailable: false,
                relatedLinks: [],
                confidence: 0.8
            });
        }
        return recommendations;
    }
    generateGeneralRecommendations(build, timeline) {
        return [
            {
                id: `general-retry-${build.id}`,
                priority: "medium",
                category: RecommendationCategory.ImmediateFix,
                title: "Retry Build",
                description: "Consider retrying the build if the failure appears transient",
                action: "Queue a new build with the same configuration",
                estimatedTime: "5 minutes",
                automationAvailable: true,
                relatedLinks: [],
                confidence: 0.6
            }
        ];
    }
    getPriorityScore(priority) {
        switch (priority) {
            case "critical": return 4;
            case "high": return 3;
            case "medium": return 2;
            case "low": return 1;
            default: return 0;
        }
    }
    async calculateSimilarity(build1, build2) {
        // Implement similarity calculation between builds
        // For now, return a basic similarity based on definition
        return build1.definition?.id === build2.definition?.id ? 0.8 : 0.3;
    }
    getSimilarityReason(similarity) {
        if (similarity > 0.9)
            return "Nearly identical failure pattern";
        if (similarity > 0.7)
            return "Similar failure characteristics";
        if (similarity > 0.5)
            return "Some common failure elements";
        return "Basic failure pattern match";
    }
    getTimeSince(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays > 0)
            return `${diffDays} day(s) ago`;
        if (diffHours > 0)
            return `${diffHours} hour(s) ago`;
        return "Less than an hour ago";
    }
    async fetchLogContent(url) {
        // This would fetch log content from the URL
        // For now, return placeholder
        return "Log content would be fetched here";
    }
    // String conversion helpers
    getBuildResultString(result) {
        switch (result) {
            case BuildResult.None: return "None";
            case BuildResult.Succeeded: return "Succeeded";
            case BuildResult.PartiallySucceeded: return "PartiallySucceeded";
            case BuildResult.Failed: return "Failed";
            case BuildResult.Canceled: return "Canceled";
            default: return "Unknown";
        }
    }
    getBuildReasonString(reason) {
        // Convert build reason enum to string
        return reason?.toString() || "Unknown";
    }
    getTaskStateString(state) {
        return state?.toString() || "Unknown";
    }
    getTaskResultString(result) {
        return result?.toString() || "Unknown";
    }
}
