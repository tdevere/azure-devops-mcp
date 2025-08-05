# Claude Prompt: Setup for Azure DevOps MCP Support Tooling

You are an AI assistant helping design a structured development plan for building support automation tools into a fork of the Azure DevOps MCP Server.

## 🎯 Objective
Enable our Azure DevOps support team to use MCP tools that can:
- Analyze pipeline failures
- Report on build durations and pass/fail trends
- Detect flaky tests
- Provide caching and performance suggestions


We aim to create a **systematic automation workflow** that adds these tools incrementally and cleanly.

## 🏗️ **Team Context & Constraints**

### **Team & Expertise:**
- **20 developers** working on this project
- **Intermediate** Azure DevOps API and MCP protocol experience
- **No dedicated QA** - developers handle testing
- **Individual subscriptions** for testing environments

### **Technical Requirements:**
- **Multi-org support** - tools may run on different orgs on same machine
- **Cached data acceptable** - results placed in markdown report files
- **Independent tools** - should work standalone, not share data/caching
- **Security conscious** - some customers have compliance constraints
- **Real-time not required** - batch processing and reports are sufficient

### **Priority & Impact:**
- **Customer-focused** - tools should solve real customer pain points
- **Support workflow integration** - replace manual data gathering processes
- **Microsoft support escalation** - better data for official support cases
- **Time savings target** - simplify customer build issue resolution

### **User Experience:**
- **MCP server access** - locally for testing, potentially public repo contribution
- **VS Code integration** - primary interface through AI assistants
- **Self-service documentation** - team can learn independently
- **Markdown report output** - for customer sharing and case documentation

### **Success Metrics:**
- **Simplify customer build issue resolution**
- **Produce better data for Microsoft support cases**
- **Usage analytics** - track tool adoption and feature utilization
- **Error monitoring** - track tool reliability and failure patterns

---

## 📋 Step 1: Create a Feature Timeline
Please generate a **week-by-week timeline** (8–12 weeks) that shows how we can implement support tools one at a time, in a sensible order. Include dependencies or prerequisites if relevant.

Each item should include:
- Week number
- Tool name
- Description
- Notes (e.g. depends on prior schema, test format, etc.)

**✅ COMPLETED:** Performance trends prioritized first (highest customer impact), followed by report generation infrastructure, then flaky test detection. See DEVELOPMENT-PLAN.md for full 10-week timeline.

---

## 🌱 Step 2: Git Branching Strategy
Define a branching methodology that fits this type of feature-first development.

Please describe:
- Primary branches (`main`, `develop`)
- Feature branch naming (e.g. `feature/tool-performance-trends`)
- PR conventions and labels (`[tool]`, `[infra]`, `[test]`, `[docs]`, `[analytics]`)
- How to deploy staging and production based on branches
- Merge strategy for integrating multiple tools (individually or in batches?)

**✅ COMPLETED:** Feature-first branching with individual tool merges, weekly releases, and clear naming conventions. Supports 20-person parallel development.

---

## 🗂️ Step 3: Folder and Naming Structure
Recommend a consistent folder layout for each support tool.

For each tool, we expect organized structure with:
- Tool implementation in categorized folders (`builds/`, `tests/`, `support/`)
- Shared utilities and types
- Comprehensive testing structure
- Generated report output directory

**✅ COMPLETED:** Scalable folder structure with tool categories, shared utilities, and dedicated report generation. See DEVELOPMENT-PLAN.md for complete layout.

---

## 🔧 **Implementation Decisions Made**

### **Architecture Choices:**
- **Extends existing MCP server** - builds on successful pipeline failure analysis
- **Same naming patterns** - consistent with `build_get_*` convention
- **Report-driven output** - markdown files for customer sharing
- **Built-in analytics** - usage tracking and error monitoring

### **Tool Prioritization Logic:**
1. **Performance trends** - highest customer impact, extends existing success
2. **Report generation** - essential infrastructure for customer data sharing
3. **Flaky test detection** - addresses major customer pain point
4. **Cache analysis** - performance optimization focus
5. **Support case reports** - streamlines workflow integration

### **Quality & Security:**
- **Individual tool testing** - comprehensive test coverage per tool
- **PII redaction capabilities** - for sensitive customer environments
- **Audit logging** - track data access and tool usage
- **Configurable data retention** - comply with customer requirements

---

## 🎯 **Next Steps for Implementation**

1. **Week 1: Performance Trends Tool**
   - `build_get_performance_trends` - analyze build duration trends
   - Detect performance regressions automatically
   - Generate optimization recommendations

2. **Week 2: Report Infrastructure**
   - Markdown report generation utilities
   - Standardized report templates
   - Customer-ready formatting

3. **Ongoing: Team Coordination**
   - Feature branch per tool for parallel development
   - Weekly integration and testing cycles
   - Continuous feedback and refinement


---

## 📦 **PLANNING COMPLETED - DELIVERABLES GENERATED**

### **✅ Documents Created:**
- **[DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md)** - Complete 10-week implementation roadmap
- **[WEEK-1-IMPLEMENTATION.md](WEEK-1-IMPLEMENTATION.md)** - Detailed Week 1 starter guide

### **✅ Key Decisions Finalized:**
- **10-week timeline** starting with performance trends and report generation
- **Customer-focused prioritization** - most impactful tools first
- **Builds on existing success** - extends pipeline failure analysis patterns
- **20-person team ready** - scalable branching and folder structure
- **Report-driven output** - markdown files for customer sharing
- **Analytics built-in** - usage tracking and error monitoring

### **🚀 Ready to Begin Implementation:**
Start with Week 1: `build_get_performance_trends` tool using the detailed implementation guide.

---

## 📝 **Historical Context: Planning Session Results**

**Date:** August 4, 2025
**Context:** Building on successful pipeline failure analysis MCP tools
**Team Size:** 20 developers with intermediate Azure DevOps/MCP experience
**Goal:** Systematic support automation tools for customer issue resolution

**Key Clarifications Gathered:**
- Multi-org deployment patterns on single machines
- Report-based output for customer data sharing
- Independent tool architecture (no shared caching)
- Security/compliance considerations for sensitive customers
- Integration with Microsoft support escalation workflows
- Usage analytics and error monitoring requirements

**Planning Approach:**
- Customer impact prioritization over technical complexity
- Build incrementally on proven foundation
- Enable parallel development across large team
- Focus on practical support workflow integration
