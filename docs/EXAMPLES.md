This guide offers step-by-step examples for using the Azure DevOps MCP Server to interact with your Azure DevOps organization. For additional tips and best practices, see the [How To guide](./HOWTO.md).

> 📝 These examples have been tested and validated only in English. If you encounter issues when using a different language, please open an issue in the repository so we can investigate.

## 🚨 **NEW: Revolutionary Build Failure Analysis**

**Experience our breakthrough AI-powered failure analysis:** **[Complete Feature Guide →](BUILD-FAILURE-REPORT-GENERATOR.md)**

### Generate Comprehensive Failure Report

Transform hours of manual investigation into 30-second AI-powered analysis:

```plaintext
Generate a comprehensive failure report for build #2847 in project "CustomerProject"
```

**What you get instantly:**
- 🔍 Root cause identification with 95% accuracy
- ⚙️ Task-level analysis with recovery hints
- 🧠 Prioritized recommendations with time estimates
- 📈 Diff analysis with last successful build
- 🔄 Pattern detection for recurring issues
- ⏱️ Timeline reconstruction showing failure progression

### Quick Failure Triage

Get immediate overview of all failed builds:

```plaintext
Show me the last 10 failed builds in project "MyProject"
```

### Pattern Analysis

Identify systematic failure patterns across pipelines:

```plaintext
Group failed builds by pipeline definition for "MyProject" in the last 7 days
```

---

[Get List of Projects](#get-list-of-projects)<br/>
[Get List of Teams](#get-list-of-teams)<br/>
[Get My Work Items](#get-my-work-items)<br/>
[Get Work Items in a Backlog](#get-all-work-items-in-a-backlog)<br/>
[Retrieve and Edit Work Items](#retrieve-and-edit-work-items)<br/>
[Create and Link Test Cases](#create-and-link-test-cases)<br/>
[Triage Work](#triage-work)<br/>
[Using Markdown Format](#adding-and-updating-work-items-using-the-format-paramater)<br/>
[Remove Links from a Work Item](#remove-one-or-more-links-from-a-work-item)

## 🙋‍♂️ Projects and Teams

### Get List of Projects

Most work item tools require project context. You can retrieve the list of projects and specify the desired project:

```plaintext
get list of ado projects
```

### Get List of Teams

This command returns all Azure DevOps projects for the organization defined in the `mcp.json` file. Similarly, you can retrieve the team context:

```plaintext
get list of teams for project contoso
```

📽️ [Azure DevOps MCP Server: Get list of projects and teams](https://youtu.be/x579E4_jNtY)

## 📅 Work Items

### Get My Work Items

Retrieve a list of work items assigned to you. This tool requires project context:

```plaintext
get my work items for project contoso
```

The model should automatically use the `wit_get_work_items_batch_by_ids` tool to fetch work item details.

📽️ [Azure DevOps MCP Server: Get my work items](https://youtu.be/y_ri8n7mBlg)

### Get All Work Items in a Backlog

You need project, team and backlog (Epics, Stories, Features) context in order to get a list of all the work items in a backlog.

```plaintext
get backlogs for Contoso project and Fabrikam team
```

Once you have the backlog levels, you can then get work items for that backlog.

```plaintext
get list of work items for Features backlog
```

The model should automatically use the `wit_get_work_items_batch_by_ids` tool to fetch work item details.

📽️ [Azure DevOps MCP Server: Get backlog](https://youtu.be/LouuyoscNrI)

### Retrieve and Edit Work Items

Get a work item, get the work item comments, update the work item fields, and add a new comment.

```plaintext
Get work item 12345 and show me fields ID, Type, State, Repro Steps, Story Points, and Priority. Get all comments for the work item and summarize them for me.
```

The model now has context of the work item. You can then update specific fields. In this case, we want the LLM to generate a better set of Repro Steps and then update the work item with those new steps. Along with updating the Story Points and State fields.

```plaintext
Polish the Repro Steps with more information and details. Then take that value and update the work item. Also update StoryPoints = 5 and State = Active.
```

Assign the work item to me and add a new comment.

```plaintext
Assign this work item to myemail@outlook.com and add a comment "I will own this Bug and get it fixed"
```

📽️ [Azure DevOps MCP Server: Work with Work Items](https://youtu.be/tT7wqSIPKdA)

### Create and Link Test Cases

Open a user story and automatically generate test cases with detailed steps based on the story's description. Link the generated test cases back to the original user story.

```plaintext
Open work item 1234 in 'Contoso' project. Then look at the description and create 1-3 Test Cases with test steps. But show me a preview first before creating the Test Case in Azure DevOps. Be sure to link the new Test Case to the User Story 1234 when you do.
```

📽️ [Azure DevOps MCP Server: Creating Test Cases from Work Item](https://youtu.be/G7fnYjlSh_w)

### Triage Work

Retrieve all work items in a backlog and triage them according to your own criteria. For example, you can fetch all bugs and user stories, identify security-related bugs, and assign them to the current team iteration. Similarly, you can select a few high-priority user stories and assign them to the most recent iteration.

Retrieve the team's iterations and backlog levels to provide the LLM with the necessary context for accurate work item management.

```plaintext
list iterations for Contoso team
```

```plaintext
list backlog levels for Contoso team
```

Retrieve the work items and their details, then instruct the LLM to identify security-related bugs and high-priority user stories. Assign the identified items to the current iteration and, if needed, to the next iteration.

```plaintext
List of work items for Stories backlog. But then go thru and find all the security related bugs. Assign the first 4 to the current iteration. If there are more than four, assign the rest to the next iteration. Then find 2-3 high priority user stories and assign them to the current iteration. Do it!
```

📽️ [Azure DevOps MCP Server: Triage Work](https://youtu.be/gCI_pPS76C8)

### Adding and Updating Work Items Using the `format` Paramater

You can use the `format` paramater to indicate markdown formatting for large text fields. It is now available on the following tools:

- **wit_update_work_items_batch**
- **wit_add_child_work_items**
- **wit_create_work_item**

> 🚩 HTML is the default unless `Markdown` is explicity set.

```plaintext
Update work item 12345 with a new description and use Markdown text. Use Markdown format param. Use bulk update.
```

📽️ [Azure DevOps MCP Server: Using Markdown format for create and update work items](https://youtu.be/OD4c2m7Fj9U)

### Remove One or More Links from a Work Item

Use this tool to remove one or more links from a work item, either by specifying individual links or by link type.

First, retrieve the work item whose links you want to remove:

```plaintext
Get work item 1234 in Contoso project and show me the relations
```

Next, remove a specific link to a work item, pull request, etc. or remove links by type (for example, "related"):

```plaintext
Remove link 5678 and 91011 from work item 1234. Also remove any related links and links to pull request 121314
```
