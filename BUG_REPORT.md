# Bug Report

## Bug 1: Pagination Offset Calculation

- **Expected Behavior:** When fetching paginated tasks, page 1 should return the first `limit` number of tasks (offset 0).
- **Actual Behavior:** The `getPaginated` function calculates `offset = page * limit`. If a user requests `page = 1` and `limit = 10`, the offset is 10, skipping the first 10 tasks.
- **Discovery:** I noticed this during code review of `src/services/taskService.js`. The math for 1-indexed pages is incorrect.
- **Fix:** Update the offset calculation to `const offset = (page - 1) * limit;`.

## Bug 2: Completing a Task Resets Priority

- **Expected Behavior:** When marking a task as complete using `PATCH /tasks/:id/complete`, the task's priority should remain unchanged.
- **Actual Behavior:** The `completeTask` function in `src/services/taskService.js` hardcodes `priority: 'medium'` when updating the task, meaning any high or low priority task will incorrectly be reset to medium priority upon completion.
- **Discovery:** Code review of `completeTask` in `src/services/taskService.js`.
- **Fix:** Remove `priority: 'medium'` from the updated object in the `completeTask` function.

## Bug 3: Status Filter Uses Partial Matching

- **Expected Behavior:** When filtering tasks by status using `GET /tasks?status=todo`, it should only return tasks with exactly the status `todo`.
- **Actual Behavior:** The `getByStatus` function uses `t.status.includes(status)`. This means if we search for status `do`, it will return tasks with `todo` and `done`.
- **Discovery:** Code review of `getByStatus` in `src/services/taskService.js`.
- **Fix:** Change the condition to strict equality `t.status === status`.
