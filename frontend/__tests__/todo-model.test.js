import TodoModel from '../js/todo-model.js';

// Мокаем глобальный fetch
global.fetch = jest.fn();

describe('TodoModel', () => {
  let model;
  let mockView;

  beforeEach(() => {
    // Создаем мок представления
    mockView = {
      renderTodos: jest.fn(),
      clearForm: jest.fn(),
      changeEdit: jest.fn(),
    };

    model = new TodoModel();
    model.view = mockView;
    fetch.mockClear();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(model.todos).toEqual([]);
      expect(model.currentId).toBe(1);
      expect(model.tempId).toBeNull();
      expect(model.filter).toBe('all');
    });
  });

  describe('fetchTodos', () => {
    it('should fetch todos and update state', async () => {
      const mockTodos = {
        1: { id: 1, text: 'Test 1', completed: false },
        2: { id: 2, text: 'Test 2', completed: true },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      });

      await model.fetchTodos();

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:6432/todos');
      expect(model.todos).toEqual(Object.values(mockTodos));
      expect(model.currentId).toBe(3);
      expect(mockView.renderTodos).toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(model.fetchTodos()).rejects.toThrow('Ошибка при загрузке задач с сервера');
    });

    it('should handle non-ok response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(model.fetchTodos()).rejects.toThrow('Ошибка при загрузке задач с сервера');
    });
  });

  describe('addTodo', () => {
    it('should add a new todo', async () => {
      const newTodo = { id: 1, text: 'New todo', dueDate: '2023-01-01', completed: false };

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await model.addTodo('New todo', '2023-01-01');

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:6432/todos/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      });

      expect(model.todos).toContainEqual(newTodo);
      expect(model.currentId).toBe(2);
      expect(mockView.clearForm).toHaveBeenCalled();
      expect(mockView.renderTodos).toHaveBeenCalled();
    });

    it('should handle add todo error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(model.addTodo('New todo')).rejects.toThrow('Ошибка при добавлении задачи');
    });
  });

  describe('toggleCompleteTodo', () => {
    it('should toggle todo completion status', async () => {
      model.todos = [{ id: 1, text: 'Test', completed: false }];

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await model.toggleCompleteTodo(1);

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:6432/todos/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      });

      expect(model.todos[0].completed).toBe(true);
      expect(mockView.renderTodos).toHaveBeenCalled();
    });

    it('should handle toggle error', async () => {
      model.todos = [{ id: 1, text: 'Test', completed: false }];
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(model.toggleCompleteTodo(1)).rejects.toThrow('Ошибка при обновлении задачи');
    });

    it('should do nothing if todo not found', async () => {
      await model.toggleCompleteTodo(999);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('changeEditTodo', () => {
    it('should set editing mode for a todo', () => {
      model.todos = [{ id: 1, text: 'Test' }];
      model.changeEditTodo(1);

      expect(model.tempId).toBe(1);
      expect(model.currentId).toBe(1);
      expect(mockView.changeEdit).toHaveBeenCalledWith({ id: 1, text: 'Test' }, true);
    });

    it('should exit editing mode when called again', () => {
      model.todos = [{ id: 1, text: 'Test' }];
      model.changeEditTodo(1);
      model.changeEditTodo(1);

      expect(model.tempId).toBeNull();
      expect(model.currentId).toBe(1);
      expect(mockView.changeEdit).toHaveBeenCalledWith({ id: 1, text: 'Test' }, false);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      model.todos = [{ id: 1, text: 'Test' }];

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await model.deleteTodo(1);

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:6432/todos/1', {
        method: 'DELETE',
      });

      expect(model.todos).toEqual([]);
      expect(mockView.renderTodos).toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      model.todos = [{ id: 1, text: 'Test' }];
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(model.deleteTodo(1)).rejects.toThrow('Ошибка при удалении задачи');
    });
  });

  describe('filterTodo', () => {
    it('should filter todos', () => {
      model.todos = [
        { id: 1, text: 'Active', completed: false },
        { id: 2, text: 'Completed', completed: true },
      ];

      model.filterTodo('active');
      expect(model.filter).toBe('active');
      expect(mockView.renderTodos).toHaveBeenCalledWith([{ id: 1, text: 'Active', completed: false }]);

      model.filterTodo('completed');
      expect(model.filter).toBe('completed');
      expect(mockView.renderTodos).toHaveBeenCalledWith([{ id: 2, text: 'Completed', completed: true }]);

      model.filterTodo('all');
      expect(model.filter).toBe('all');
      expect(mockView.renderTodos).toHaveBeenCalledWith(model.todos);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo', async () => {
      model.todos = [{ id: 1, text: 'Old', completed: false }];
      const updates = { text: 'New', dueDate: '2023-01-01' };

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await model.updateTodo(1, updates);

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:6432/todos/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      expect(model.todos[0]).toEqual({ id: 1, text: 'New', completed: false, dueDate: '2023-01-01' });
      expect(mockView.clearForm).toHaveBeenCalled();
      expect(mockView.renderTodos).toHaveBeenCalled();
    });

    it('should handle update error', async () => {
      model.todos = [{ id: 1, text: 'Old' }];
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(model.updateTodo(1, { text: 'New' })).rejects.toThrow('Ошибка при обновлении задачи');
    });
  });

  describe('getTodos', () => {
    it('should return filtered todos', () => {
      model.todos = [
        { id: 1, text: 'Active', completed: false },
        { id: 2, text: 'Completed', completed: true },
      ];

      model.filter = 'all';
      expect(model.getTodos()).toEqual(model.todos);

      model.filter = 'active';
      expect(model.getTodos()).toEqual([{ id: 1, text: 'Active', completed: false }]);

      model.filter = 'completed';
      expect(model.getTodos()).toEqual([{ id: 2, text: 'Completed', completed: true }]);
    });
  });

  describe('setEditingId', () => {
    it('should set editingId', () => {
      model.setEditingId(5);
      expect(model.editingId).toBe(5);
    });
  });
});