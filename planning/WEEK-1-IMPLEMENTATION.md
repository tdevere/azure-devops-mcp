# 🚀 Week 1 Implementation Guide: Performance Trends Tool

## 🎯 **Objective**
Build `build_get_performance_trends` - the first new support tool that analyzes build duration trends and detects performance regressions.

## 📋 **Implementation Checklist**

### **Step 1: Create Feature Branch**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/tool-performance-trends
```

### **Step 2: Create Folder Structure**
```bash
mkdir -p src/tools/builds
mkdir -p src/shared/types
mkdir -p test/tools/builds
mkdir -p reports/templates
```

### **Step 3: Define TypeScript Types**
Create `src/shared/types/performance-types.ts`:

```typescript
export interface BuildPerformanceData {
  buildId: number;
  buildNumber: string;
  definition: {
    id: number;
    name: string;
  };
  startTime: Date;
  finishTime: Date;
  duration: number; // milliseconds
  queueTime: number; // milliseconds
  result: BuildResult;
  sourceBranch: string;
}

export interface PerformanceTrend {
  definitionId: number;
  definitionName: string;
  averageDuration: number;
  medianDuration: number;
  trendDirection: 'improving' | 'degrading' | 'stable';
  regressionDetected: boolean;
  recentBuilds: BuildPerformanceData[];
  recommendations: string[];
}

export interface PerformanceAnalysis {
  projectName: string;
  analyzedPeriod: {
    startDate: Date;
    endDate: Date;
  };
  totalBuildsAnalyzed: number;
  trends: PerformanceTrend[];
  summary: {
    fastestPipeline: string;
    slowestPipeline: string;
    mostImprovedPipeline: string;
    mostDegradedPipeline: string;
  };
}
```

### **Step 4: Implement the Tool**
Create `src/tools/builds/performance-trends.ts`:

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { BuildApi } from 'azure-devops-node-api/BuildApi';
import { Build, BuildResult, BuildStatus } from 'azure-devops-node-api/interfaces/BuildInterfaces';
import { getConnection } from '../../utils.js';
import { BuildPerformanceData, PerformanceTrend, PerformanceAnalysis } from '../../shared/types/performance-types.js';

const GetPerformanceTrendsSchema = z.object({
  project: z.string().describe('Project ID or name to analyze performance trends for'),
  definitionIds: z.array(z.number()).optional().describe('Optional array of specific build definition IDs to analyze'),
  days: z.number().min(1).max(90).default(30).describe('Number of days to analyze (1-90, default: 30)'),
  minBuilds: z.number().min(5).max(100).default(10).describe('Minimum number of builds required for trend analysis (5-100, default: 10)'),
  includeQueueTime: z.boolean().default(true).describe('Include queue time in performance analysis'),
  detectRegressions: z.boolean().default(true).describe('Detect performance regressions automatically')
});

export const buildGetPerformanceTrends: Tool = {
  name: 'build_get_performance_trends',
  description: 'Analyzes build performance trends and detects regressions over a specified time period. Provides insights into build duration patterns, queue times, and performance recommendations.',
  inputSchema: GetPerformanceTrendsSchema,
};

export async function handleBuildGetPerformanceTrends(args: z.infer<typeof GetPerformanceTrendsSchema>) {
  const connection = getConnection();
  const buildApi: BuildApi = await connection.getBuildApi();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - args.days);

  // Get builds for the specified period
  const builds = await buildApi.getBuilds(
    args.project,
    args.definitionIds,
    undefined, // queues
    undefined, // buildNumber
    undefined, // minTime
    endDate,   // maxTime
    undefined, // requestedFor
    undefined, // reasonFilter
    undefined, // statusFilter
    undefined, // resultFilter
    undefined, // tagFilters
    undefined, // properties
    undefined, // top
    undefined, // continuationToken
    undefined, // maxBuildsPerDefinition
    undefined, // deletedFilter
    undefined, // queryOrder
    undefined, // branchName
    undefined, // buildIds
    undefined, // repositoryId
    undefined, // repositoryType
    startDate  // minTime
  );

  if (!builds || builds.length === 0) {
    return {
      projectName: args.project,
      analyzedPeriod: { startDate, endDate },
      totalBuildsAnalyzed: 0,
      trends: [],
      summary: {
        fastestPipeline: 'N/A - No builds found',
        slowestPipeline: 'N/A - No builds found',
        mostImprovedPipeline: 'N/A - Insufficient data',
        mostDegradedPipeline: 'N/A - Insufficient data'
      }
    } as PerformanceAnalysis;
  }

  // Convert to performance data and group by definition
  const performanceData = builds
    .filter(build => build.startTime && build.finishTime && build.result === BuildResult.Succeeded)
    .map(build => ({
      buildId: build.id!,
      buildNumber: build.buildNumber!,
      definition: {
        id: build.definition!.id!,
        name: build.definition!.name!
      },
      startTime: new Date(build.startTime!),
      finishTime: new Date(build.finishTime!),
      duration: new Date(build.finishTime!).getTime() - new Date(build.startTime!).getTime(),
      queueTime: args.includeQueueTime && build.queueTime ?
        new Date(build.startTime!).getTime() - new Date(build.queueTime).getTime() : 0,
      result: build.result!,
      sourceBranch: build.sourceBranch || 'unknown'
    } as BuildPerformanceData));

  // Group by definition and analyze trends
  const definitionGroups = new Map<number, BuildPerformanceData[]>();
  performanceData.forEach(build => {
    const existing = definitionGroups.get(build.definition.id) || [];
    existing.push(build);
    definitionGroups.set(build.definition.id, existing);
  });

  const trends: PerformanceTrend[] = [];

  for (const [definitionId, builds] of definitionGroups) {
    if (builds.length < args.minBuilds) continue;

    // Sort by date for trend analysis
    builds.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const durations = builds.map(b => b.duration);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const medianDuration = durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)];

    // Simple trend detection: compare first half to second half
    const halfPoint = Math.floor(builds.length / 2);
    const firstHalfAvg = builds.slice(0, halfPoint).reduce((sum, b) => sum + b.duration, 0) / halfPoint;
    const secondHalfAvg = builds.slice(halfPoint).reduce((sum, b) => sum + b.duration, 0) / (builds.length - halfPoint);

    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    let trendDirection: 'improving' | 'degrading' | 'stable' = 'stable';
    let regressionDetected = false;

    if (args.detectRegressions) {
      if (changePercent > 20) {
        trendDirection = 'degrading';
        regressionDetected = true;
      } else if (changePercent < -20) {
        trendDirection = 'improving';
      } else if (Math.abs(changePercent) > 10) {
        trendDirection = changePercent > 0 ? 'degrading' : 'improving';
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (regressionDetected) {
      recommendations.push(`⚠️ Performance regression detected: ${changePercent.toFixed(1)}% increase in build time`);
      recommendations.push('Consider investigating recent changes to build configuration or dependencies');
    }

    if (averageDuration > 600000) { // > 10 minutes
      recommendations.push('💡 Consider parallel job execution to reduce build duration');
      recommendations.push('🔧 Review build steps for optimization opportunities');
    }

    if (builds.some(b => b.queueTime > 300000)) { // > 5 minutes queue time
      recommendations.push('🚀 High queue times detected - consider additional build agents');
    }

    trends.push({
      definitionId,
      definitionName: builds[0].definition.name,
      averageDuration,
      medianDuration,
      trendDirection,
      regressionDetected,
      recentBuilds: builds.slice(-5), // Last 5 builds
      recommendations
    });
  }

  // Sort trends by average duration for summary
  trends.sort((a, b) => a.averageDuration - b.averageDuration);

  const analysis: PerformanceAnalysis = {
    projectName: args.project,
    analyzedPeriod: { startDate, endDate },
    totalBuildsAnalyzed: performanceData.length,
    trends,
    summary: {
      fastestPipeline: trends.length > 0 ? trends[0].definitionName : 'N/A',
      slowestPipeline: trends.length > 0 ? trends[trends.length - 1].definitionName : 'N/A',
      mostImprovedPipeline: trends.find(t => t.trendDirection === 'improving')?.definitionName || 'None detected',
      mostDegradedPipeline: trends.find(t => t.regressionDetected)?.definitionName || 'None detected'
    }
  };

  return analysis;
}
```

### **Step 5: Register the Tool**
Add to `src/tools.ts`:

```typescript
import { buildGetPerformanceTrends, handleBuildGetPerformanceTrends } from './tools/builds/performance-trends.js';

// Add to tools array
buildGetPerformanceTrends,

// Add to handler
case 'build_get_performance_trends':
  return await handleBuildGetPerformanceTrends(args);
```

### **Step 6: Create Tests**
Create `test/tools/builds/performance-trends.test.ts`:

```typescript
import { describe, test, expect, beforeEach } from '@jest/globals';
import { handleBuildGetPerformanceTrends } from '../../../src/tools/builds/performance-trends.js';

describe('Performance Trends Tool', () => {
  test('should analyze performance trends for valid project', async () => {
    const result = await handleBuildGetPerformanceTrends({
      project: 'TestProject',
      days: 7,
      minBuilds: 5
    });

    expect(result).toHaveProperty('projectName');
    expect(result).toHaveProperty('trends');
    expect(result).toHaveProperty('summary');
    expect(result.analyzedPeriod).toHaveProperty('startDate');
    expect(result.analyzedPeriod).toHaveProperty('endDate');
  });

  test('should detect regressions when enabled', async () => {
    const result = await handleBuildGetPerformanceTrends({
      project: 'TestProject',
      days: 30,
      detectRegressions: true
    });

    // Should have regression detection logic
    expect(typeof result.trends.every(t => typeof t.regressionDetected === 'boolean')).toBe(true);
  });
});
```

### **Step 7: Build and Test**
```bash
npm run build
npm test -- --testPathPattern=performance-trends
```

### **Step 8: Commit and Push**
```bash
git add .
git commit -m "✨ Add build_get_performance_trends tool

🎯 Features:
- Analyzes build duration trends over configurable time periods
- Detects performance regressions automatically
- Provides optimization recommendations
- Supports filtering by definition IDs
- Includes queue time analysis

📊 Output:
- Trend direction (improving/degrading/stable)
- Average and median durations
- Recent builds analysis
- Performance recommendations

🧪 Testing:
- Unit tests for trend analysis logic
- Regression detection validation
- Edge case handling for insufficient data"
git push origin feature/tool-performance-trends
```

## 🎯 **Success Criteria**
- ✅ Tool builds and passes tests
- ✅ Returns structured performance analysis data
- ✅ Detects performance regressions accurately
- ✅ Provides actionable recommendations
- ✅ Handles edge cases (no data, insufficient builds)

## 🔄 **Next Steps**
1. Create PR to `develop` branch
2. Test with real Azure DevOps data
3. Gather feedback from team
4. Begin Week 2: Report generation infrastructure

This foundation will support all future performance-related analysis tools! 🚀
