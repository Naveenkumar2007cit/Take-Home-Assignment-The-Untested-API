const taskService = require('../src/services/taskService');

describe('Task Service', () => {
  beforeEach(() => {
    taskService._reset();
  });

  it('should create a task', () => {
    const task = taskService.create({ title: 'Test Task' });
    expect(task.id).toBeDefined();
    expect(task.title).toEqual('Test Task');
    expect(task.status).toEqual('todo');
    expect(task.priority).toEqual('medium');
  });

  it('should get all tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    const tasks = taskService.getAll();
    expect(tasks.length).toEqual(2);
  });

  it('should find by id', () => {
    const task = taskService.create({ title: 'Task 1' });
    const found = taskService.findById(task.id);
    expect(found).toEqual(task);
  });

  it('should filter by status', () => {
    taskService.create({ title: 'Task 1', status: 'todo' });
    taskService.create({ title: 'Task 2', status: 'done' });
    const tasks = taskService.getByStatus('todo');
    expect(tasks.length).toEqual(1);
    expect(tasks[0].title).toEqual('Task 1');
  });

  it('should get paginated tasks', () => {
    for (let i = 0; i < 5; i++) {
      taskService.create({ title: `Task ${i}` });
    }
    const page0 = taskService.getPaginated(0, 2);
    expect(page0.length).toEqual(2);
    expect(page0[0].title).toEqual('Task 0');
    expect(page0[1].title).toEqual('Task 1');
  });

  it('should get stats', () => {
    taskService.create({ title: 'Task 1', status: 'todo' });
    taskService.create({ title: 'Task 2', status: 'done' });
    taskService.create({ 
      title: 'Task 3', 
      status: 'todo', 
      dueDate: new Date(Date.now() - 10000).toISOString() 
    });

    const stats = taskService.getStats();
    expect(stats.todo).toEqual(2);
    expect(stats.done).toEqual(1);
    expect(stats.overdue).toEqual(1);
  });

  it('should update a task', () => {
    const task = taskService.create({ title: 'Task 1' });
    const updated = taskService.update(task.id, { title: 'Updated Task' });
    expect(updated.title).toEqual('Updated Task');
  });

  it('should return null when updating non-existent task', () => {
    const updated = taskService.update('non-existent', { title: 'Updated' });
    expect(updated).toBeNull();
  });

  it('should remove a task', () => {
    const task = taskService.create({ title: 'Task 1' });
    const result = taskService.remove(task.id);
    expect(result).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  it('should return false when removing non-existent task', () => {
    const result = taskService.remove('non-existent');
    expect(result).toBe(false);
  });

  it('should complete a task', () => {
    const task = taskService.create({ title: 'Task 1', priority: 'high' });
    const completed = taskService.completeTask(task.id);
    expect(completed.status).toEqual('done');
    expect(completed.completedAt).not.toBeNull();
  });

  it('should return null when completing non-existent task', () => {
    const completed = taskService.completeTask('non-existent');
    expect(completed).toBeNull();
  });
});
