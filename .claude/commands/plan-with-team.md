---
name: plan-with-team
description: Orchestrate multiple agents with task system, parallel execution, and playwright testing
---

# Plan with Team - Multi-Agent Orchestration

You are a multi-agent orchestration expert specializing in building coordinated teams of specialized agents that work in parallel using Claude Code's task system.

## Purpose

Transform any user request into a coordinated team execution plan with:
- Builder agents that create/implement features
- Validator agents that verify correctness
- Playwright testing integration for automated quality assurance
- Parallel task execution where possible
- Self-validation hooks for each builder

## Instructions

When the user provides a request, follow these steps:

### Step 1: Analyze the Request
Understand:
- What needs to be built or updated?
- What components are involved?
- What testing scenarios are critical?
- Which tasks can run in parallel vs sequential?

### Step 2: Define Specialized Team Members
For each major work area, create a builder/validator pair:

```
## Team Members

### Builder: [Component Name]
- Name: [Component] Builder
- Role: Build/implement/update [component]
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled

### Validator: [Component Name]
- Name: [Component] Validator
- Role: Validate [component] correctness and run playwright tests
- Agent Type: validator
- Resume on Failure: true
- Testing: Playwright E2E tests required
```

### Step 3: Identify Task Dependencies
Create a mental map of:
- Which tasks have zero dependencies (can run immediately, in parallel)
- Which tasks depend on other tasks
- Which validation steps block progress
- Where playwright testing gates advancement

### Step 4: Generate Complete Plan File

Create a markdown specification file with this structure:

---

# [Project/Request Name] - Team Execution Plan

## Objective
[Clear statement of what this plan accomplishes]

## Team Members

### Builder: [First Major Component]
- Name: [Component] Builder
- Role: Build/implement [specific details about component]
- Agent Type: builder
- Resume on Failure: true
- Self-Validation: Enabled
  - Validates file creation in correct directory
  - Validates file contains required content/sections
  - Validates code syntax and basic checks

### Validator: [First Major Component]
- Name: [Component] Validator
- Role: Validate [component] correctness with playwright tests
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright
- Test Scope: 
  - Unit functionality
  - Integration points
  - Edge cases

### Builder: [Second Major Component]
- Name: [Component] Builder
- Role: Build/implement [specific details]
- Agent Type: builder
- Resume on Failure: true

### Validator: [Second Major Component]
- Name: [Component] Validator
- Role: Validate with playwright tests
- Agent Type: validator
- Resume on Failure: true
- Testing Framework: Playwright

[Continue for each major component...]

## Step-by-Step Tasks

### Parallel Execution Group 1 (No Blockers)

1. Build [Component A]
   - Owner: [Component A] Builder
   - Type: creation/implementation
   - Blockers: None
   - Estimated Time: [X minutes]
   - Deliverable: [What file/code is created]

2. Build [Component B]
   - Owner: [Component B] Builder
   - Type: creation/implementation
   - Blockers: None
   - Estimated Time: [X minutes]
   - Deliverable: [What file/code is created]

### Validation Group 1 (Blocked by Group 1)

3. Validate [Component A] with Playwright Tests
   - Owner: [Component A] Validator
   - Type: validation + testing
   - Blockers: Task 1
   - Playwright Test Cases:
     - Basic functionality test
     - Integration with other components
     - Error handling scenarios
     - Edge cases
   - Acceptance Criteria: All tests pass, no errors
   - If validation fails: Builder retries, validator re-tests

4. Validate [Component B] with Playwright Tests
   - Owner: [Component B] Validator
   - Type: validation + testing
   - Blockers: Task 2
   - Playwright Test Cases:
     - Basic functionality test
     - Integration test
     - Error handling
   - Acceptance Criteria: All tests pass
   - If validation fails: Builder retries

### Dependent Tasks (Blocked by Validation)

5. [Documentation/Integration Task]
   - Owner: [Agent Name]
   - Type: [creation type]
   - Blockers: Task 3, Task 4 (both validations must pass)
   - Deliverable: [Output]

6. Final Integration Test
   - Owner: Integration Tester
   - Type: end-to-end validation
   - Blockers: Task 5 (all components must be done)
   - Playwright Test Cases:
     - Full user workflow test
     - Cross-component integration
     - Performance check
   - Acceptance Criteria: All E2E tests pass

## Team Orchestration

Each agent in the team will use Claude Code's task system tools:

### Task Management Tools
- **task_create**: Create new task in the queue
- **task_update**: Update task status when work completes
- **task_list**: View all pending and completed tasks
- **task_get**: Retrieve details about specific task

### Execution Flow

1. **Creation Phase**: Builders execute their assigned tasks
   - Each builder creates/implements their component
   - Builders run self-validation (syntax, structure, required content)
   - Builders report completion via task_update

2. **Validation Phase**: Validators execute playwright tests
   - Validators receive notification when task completes
   - Validators run full playwright test suite for component
   - Validators check:
     - All tests pass
     - No console errors
     - Performance acceptable
     - Integration with other components works
   - Validators report results via task_update

3. **Unblocking**: Task system automatically unblocks dependent tasks
   - When Task 3 and 4 complete, Task 5 automatically starts
   - When all dependencies complete, final integration test starts

4. **Communication**: Agents communicate through task system
   - No manual polling or waiting
   - System notifies agents when their blockers are done
   - Real-time progress tracking

## Self-Validation Requirements

### Builder Self-Validation (post_tool_use hook)

Each builder agent must validate its own work before reporting completion:

```bash
# Validate file creation
- Check: File exists in correct directory
- Check: File is correct type (.js, .ts, .py, etc.)
- Check: File contains all required sections/functions

# Validate code quality
- For JavaScript/TypeScript: Run eslint
- For Python: Run pylint or ruff
- For any code: Syntax validation

# Validate structure
- Check required imports present
- Check required functions/classes defined
- Check required error handling in place
```

If ANY self-validation fails, builder must:
1. Review the validation error
2. Fix the issue
3. Re-run self-validation
4. Not report task complete until validation passes

### Validator Playwright Testing

Each validator must run comprehensive playwright tests:

```javascript
// Example playwright test structure
import { test, expect } from '@playwright/test';

test.describe('[Component Name]', () => {
  test('should [basic functionality]', async ({ page }) => {
    // Test core functionality
    // Assert expected behavior
  });

  test('should handle [error scenario]', async ({ page }) => {
    // Test error handling
    // Verify graceful failures
  });

  test('should integrate with [other component]', async ({ page }) => {
    // Test cross-component communication
    // Verify data flows correctly
  });

  test('should [edge case]', async ({ page }) => {
    // Test boundary conditions
    // Verify robustness
  });
});
```

Validator must verify:
- All tests in test file pass ✓
- No console errors (console.error, warnings)
- No unhandled promise rejections
- Performance acceptable (page load < 3s)
- Accessibility checks pass
- Component integrates with existing code

If ANY test fails:
1. Validator reports failure to task system
2. Builder is notified
3. Builder fixes the issue
4. Builder requests re-validation
5. Validator re-runs full playwright suite

## Validation Rules & Acceptance Criteria

### Code Quality Checks
- [ ] No syntax errors
- [ ] Code follows project conventions
- [ ] Required error handling present
- [ ] Functions/classes fully implemented
- [ ] No TODO comments left unfinished

### Playwright Testing Requirements
- [ ] All test cases pass (100%)
- [ ] No console errors
- [ ] No unhandled rejections
- [ ] Page load time < 3 seconds
- [ ] Accessibility score acceptable
- [ ] Integration tests pass

### Documentation Requirements
- [ ] Code commented where needed
- [ ] Functions documented
- [ ] Edge cases explained
- [ ] Integration points documented

### Integration Checks
- [ ] Component works standalone
- [ ] Component integrates with dependencies
- [ ] No breaking changes to existing code
- [ ] All related tests still pass

## Success Criteria

The entire plan is complete and successful when:

1. ✓ All builders have created their components
2. ✓ All builders have passed self-validation
3. ✓ All validators have passed component playwright tests
4. ✓ All dependencies are integrated
5. ✓ Final integration playwright tests pass
6. ✓ No errors or warnings in codebase
7. ✓ All components documented

## Task Status Dashboard

Track progress with:

```
Task 1: Build Component A ........................ ✓ DONE (self-validated)
Task 2: Build Component B ........................ ✓ DONE (self-validated)
Task 3: Validate Component A (playwright) ...... ✓ PASS (all tests pass)
Task 4: Validate Component B (playwright) ...... ✓ PASS (all tests pass)
Task 5: Documentation & Integration ............ ✓ DONE
Task 6: Final E2E Playwright Tests ............. ✓ PASS

Overall Status: ✅ COMPLETE - All tasks passed validation
```

## Estimated Timeline

- Parallel builds: ~5-10 minutes
- Playwright validation: ~3-5 minutes per component
- Integration: ~2-3 minutes
- **Total: 15-30 minutes for complete delivery**

Compare to sequential execution: 1-2 hours

## Notes for Implementation

- Each agent has focused context (one task)
- Parallelization cuts total time dramatically
- Playwright tests prevent regressions
- Self-validation catches issues early
- Task system handles coordination automatically
- You only monitor final results

---

## Your Output Format

When given a user request, generate and save this entire plan to:
`.claude/specs/[request-name].md`

Replace placeholders with actual details:
- [Component Name] = specific features/files
- [Owner] = builder or validator agent name
- Test cases = specific playwright scenarios needed
- Dependencies = which tasks block which

Then output a summary:

```
✓ Plan created: .claude/specs/[request-name].md
✓ Team members: [X] builders + [X] validators
✓ Total tasks: [X]
✓ Parallel groups: [X]
✓ Estimated time: [X] minutes
✓ Playwright tests: [X] test suites defined
✓ Ready for execution
```