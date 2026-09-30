const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Tasks API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const res = await request(app).get('/tasks');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2);
    });

    it('should filter by status', async () => {
      taskService.create({ title: 'Task 1', status: 'todo' });
      taskService.create({ title: 'Task 2', status: 'done' });

      const res = await request(app).get('/tasks').query({ status: 'todo' });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].title).toEqual('Task 1');
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 15; i++) {
        taskService.create({ title: `Task ${i}` });
      }

      const res = await request(app).get('/tasks').query({ page: 1, limit: 10 });
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(10);
    });
  });

  describe('GET /tasks/stats', () => {
    it('should return stats', async () => {
      taskService.create({ title: 'Task 1', status: 'todo' });
      taskService.create({ title: 'Task 2', status: 'in_progress' });
      taskService.create({ title: 'Task 3', status: 'done' });

      const res = await request(app).get('/tasks/stats');
      expect(res.statusCode).toEqual(200);
      expect(res.body.todo).toEqual(1);
      expect(res.body.in_progress).toEqual(1);
      expect(res.body.done).toEqual(1);
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'New Task' });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toEqual('New Task');
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({});
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update an existing task', async () => {
      const task = taskService.create({ title: 'Old Title' });

      const res = await request(app)
        .put(`/tasks/${task.id}`)
        .send({ title: 'New Title' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('New Title');
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app)
        .put('/tasks/non-existent-id')
        .send({ title: 'New Title' });
      
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = taskService.create({ title: 'To Delete' });

      const res = await request(app).delete(`/tasks/${task.id}`);
      expect(res.statusCode).toEqual(204);

      const found = taskService.findById(task.id);
      expect(found).toBeUndefined();
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app).delete('/tasks/non-existent-id');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    it('should complete an existing task', async () => {
      const task = taskService.create({ title: 'To Complete' });

      const res = await request(app).patch(`/tasks/${task.id}/complete`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('done');
      expect(res.body.completedAt).not.toBeNull();
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app).patch('/tasks/non-existent-id/complete');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    it('should assign a task', async () => {
      const task = taskService.create({ title: 'To Assign' });

      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: 'John Doe' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.assignee).toEqual('John Doe');
    });

    it('should return 400 if assignee is empty', async () => {
      const task = taskService.create({ title: 'To Assign' });

      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: '' });
      
      expect(res.statusCode).toEqual(400);
    });

    it('should return 404 if task not found', async () => {
      const res = await request(app)
        .patch('/tasks/non-existent-id/assign')
        .send({ assignee: 'John Doe' });
      
      expect(res.statusCode).toEqual(404);
    });
  });
});
