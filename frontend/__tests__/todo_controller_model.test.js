import TodoModel from '../js/todo-model.js';
import TodoController from '../js/todo-controller.js';

describe('TodoModel', () => {
  let model;
  let mockView = {
    renderTodos: jest.fn(),
    clearForm: jest.fn(),
    changeEdit: jest.fn()
  };

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    }));
    model = new TodoModel();
    model.view = mockView;
    jest.clearAllMocks();
  });

  describe('initialize and fetchTodos', () => {
    it('should initialize with empty todos and currentId=1', () => {
      expect(model.todos).toEqual([]);
      expect(model.currentId).toBe(1);
    });

    it('should fetch todos and update currentId based on max id', async () => {
      const mockTodos = {
        1: { id: 5, text: 'Task 1', completed: false },
        2: { id: 8, text: 'Task 2', completed: true },
        3: { id: 3, text: 'Task 3', completed: false }
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos
      });

      await model.fetchTodos();

      expect(model.todos.length).toBe(3);
      expect(model.currentId).toBe(9);
      expect(mockView.renderTodos).toHaveBeenCalled();
    });

    it('should handle empty response from server', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await model.fetchTodos();

      expect(model.todos.length).toBe(0);
      expect(model.currentId).toBe(1);
    });

    it('should correctly handle todos with random unsorted IDs (1-20)', async () => {
      const generateRandomIds = () => {
        const ids = new Set();
        while (ids.size < 4) {
          ids.add(Math.floor(Math.random() * 20) + 1);
        }
        return Array.from(ids);
      };

      const randomIds = generateRandomIds();
      console.log('Testing with random IDs (1-20):', randomIds);

      const initialTodos = randomIds.reduce((acc, id, index) => {
        acc[index] = { 
          id, 
          text: `Task ${id}`, 
          completed: index % 2 === 0 
        };
        return acc;
      }, {});

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialTodos
      });

      await model.fetchTodos();

      expect(model.todos.map(t => t.id)).toEqual(expect.arrayContaining(randomIds));
      expect(model.currentId).toBe(Math.max(...randomIds) + 1);

      const idToDelete = randomIds[1];
      console.log(`Deleting task with ID: ${idToDelete}`);

      fetch.mockResolvedValueOnce({ ok: true });
      await model.deleteTodo(idToDelete);
      
      expect(model.todos.some(t => t.id === idToDelete)).toBe(false);

      const expectedNewId = Math.max(...randomIds) + 1;
      fetch.mockResolvedValueOnce({ ok: true });
      await model.addTodo('New Random Task', '2023-01-01');
      
      expect(model.todos.some(t => t.id === expectedNewId)).toBe(true);
      expect(model.currentId).toBe(expectedNewId + 1);

      const idToToggle = randomIds[2];
      console.log(`Toggling task with ID: ${idToToggle}`);

      const initialStatus = model.todos.find(t => t.id === idToToggle)?.completed;
      if (initialStatus !== undefined) {
        fetch.mockResolvedValueOnce({ ok: true });
        await model.toggleCompleteTodo(idToToggle);
        expect(model.todos.find(t => t.id === idToToggle).completed).toBe(!initialStatus);
      }
    });
  });

  describe('addTodo', () => {
    it('should add new todo with incrementing ID', async () => {
      fetch.mockResolvedValueOnce({ 
        ok: true,
        json: async () => ({ id: 1 })
      });
      
      await model.addTodo('New task', '2023-01-01');
      
      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:6432/todos/1',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      expect(model.todos).toHaveLength(1);
      expect(model.currentId).toBe(2);
    });

    it('should handle multiple adds with existing todos', async () => {
      model.todos = [{ id: 10, text: 'Existing', completed: false }];
      model.currentId = 11;
      fetch.mockResolvedValue({ ok: true });
      
      await model.addTodo('Task 1', '2023-01-01');
      await model.addTodo('Task 2', '2023-01-02');
      
      expect(model.todos).toHaveLength(3);
      expect(model.todos[1].id).toBe(11);
      expect(model.todos[2].id).toBe(12);
      expect(model.currentId).toBe(13);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo and keep correct ID sequence', async () => {
      model.todos = [
        { id: 1, text: 'Task 1', completed: false },
        { id: 5, text: 'Task 2', completed: true },
        { id: 8, text: 'Task 3', completed: false }
      ];
      model.currentId = 9;
      fetch.mockResolvedValue({ ok: true });
      
      await model.deleteTodo(5);
      
      expect(model.todos).toHaveLength(2);
      expect(model.todos.some(t => t.id === 5)).toBe(false);
      expect(model.currentId).toBe(9);
    });
  });

  describe('toggleCompleteTodo', () => {
    it('should toggle completion status', async () => {
      model.todos = [{ id: 1, text: 'Task', completed: false }];
      fetch.mockResolvedValue({ ok: true });
      
      await model.toggleCompleteTodo(1);
      expect(model.todos[0].completed).toBe(true);
      
      await model.toggleCompleteTodo(1);
      expect(model.todos[0].completed).toBe(false);
    });
  });

  describe('changeEditTodo', () => {
    it('should handle edit mode switching correctly', () => {
      model.currentId = 5;
      
      model.changeEditTodo(2);
      expect(model.currentId).toBe(2);
      expect(model.tempId).toBe(5);
      
      model.changeEditTodo(2);
      expect(model.currentId).toBe(5);
      expect(model.tempId).toBe(null);
    });
  });

  describe('filterTodo', () => {
    beforeEach(() => {
      model.todos = [
        { id: 1, text: 'Task 1', completed: false },
        { id: 2, text: 'Task 2', completed: true },
        { id: 3, text: 'Task 3', completed: false }
      ];
    });

    it('should filter completed todos', () => {
      model.filterTodo('completed');
      const filtered = model.getTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    it('should filter active todos', () => {
      model.filterTodo('active');
      const filtered = model.getTodos();
      expect(filtered).toHaveLength(2);
      expect(filtered.map(t => t.id)).toEqual([1, 3]);
    });

    it('should return all todos when filter is all', () => {
      model.filterTodo('all');
      expect(model.getTodos()).toHaveLength(3);
    });
  });
});

describe('TodoController', () => {
  let controller;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      todos: [],
      tempId: null,
      currentId: 1,
      view: { clearForm: jest.fn() },
      addTodo: jest.fn(),
      updateTodo: jest.fn(),
      changeEditTodo: jest.fn(),
      toggleCompleteTodo: jest.fn(),
      deleteTodo: jest.fn(),
      filterTodo: jest.fn(),
      editTodo: jest.fn(),
      toggleTodo: jest.fn()
    };
    
    controller = new TodoController(mockModel);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error when model is not provided', () => {
      expect(() => new TodoController()).toThrow('Model is required');
    });
  });

  describe('handleSetDataTodo', () => {
    beforeEach(() => {
      mockModel.todos.some = jest.fn().mockReturnValue(false);
    });

    it('should call addTodo for new task', async () => {
      await controller.handleSetDataTodo('New task', '2023-01-01');
      expect(mockModel.addTodo).toHaveBeenCalledWith('New task', '2023-01-01');
      expect(mockModel.view.clearForm).toHaveBeenCalled();
    });

    it('should call updateTodo when in edit mode', async () => {
      mockModel.tempId = 100;
      mockModel.currentId = 5;
      
      await controller.handleSetDataTodo('Updated task', '2023-01-01');
      expect(mockModel.updateTodo).toHaveBeenCalledWith(5, { text: 'Updated task', date: '2023-01-01' });
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith(5);
      expect(mockModel.view.clearForm).toHaveBeenCalled();
    });

    it('should prevent duplicates', async () => {
      mockModel.todos.some.mockReturnValue(true);
      
      await controller.handleSetDataTodo('Existing task', '2023-01-01');
      expect(mockModel.addTodo).not.toHaveBeenCalled();
      expect(mockModel.view.clearForm).toHaveBeenCalled();
    });
  });

  describe('handleChangeTodo', () => {
    const createMockClassList = (classes) => ({
      contains: (cls) => classes.includes(cls)
    });

    it('should handle toggle action', async () => {
      const classList = createMockClassList(['toggle']);
      await controller.handleChangeTodo(1, classList);
      expect(mockModel.toggleCompleteTodo).toHaveBeenCalledWith(1);
    });

    it('should handle edit action', async () => {
      const classList = createMockClassList(['edit']);
      await controller.handleChangeTodo(1, classList);
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith(1);
    });

    it('should handle delete action', async () => {
      const classList = createMockClassList(['delete']);
      await controller.handleChangeTodo(1, classList);
      expect(mockModel.deleteTodo).toHaveBeenCalledWith(1);
    });

    it('should exit edit mode before delete if in edit mode', async () => {
      mockModel.tempId = 100;
      const classList = createMockClassList(['delete']);
      await controller.handleChangeTodo(1, classList);
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith(1);
      expect(mockModel.deleteTodo).toHaveBeenCalledWith(1);
    });
  });

  describe('handleFilterChange', () => {
    it('should call model filter method', async () => {
      await controller.handleFilterChange('completed');
      expect(mockModel.filterTodo).toHaveBeenCalledWith('completed');
    });
  });
});