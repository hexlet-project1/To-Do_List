import TodoController from '../js/todo-controller.js';

// Полноценный mock модели со всеми необходимыми методами
const createMockModel = () => ({
  filterTodo: jest.fn(),
  addTodo: jest.fn(),
  editTodo: jest.fn(),
  deleteTodo: jest.fn(),
  toggleTodo: jest.fn(),
  updateTodo: jest.fn(),
  toggleCompleteTodo: jest.fn(),
  changeEditTodo: jest.fn(),
  getTodos: jest.fn(() => []),
  todos: { some: jest.fn() },
  tempId: null,
  currentId: null,
  view: { clearForm: jest.fn() }
});

describe('TodoController', () => {
  let controller;
  let mockModel;

  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = createMockModel();
    controller = new TodoController(mockModel);
  });

  describe('constructor', () => {
    it('should throw error when model is not provided', () => {
      expect(() => new TodoController()).toThrow('Model is required');
    });

    it('should initialize with provided model', () => {
      expect(controller.model).toBe(mockModel);
    });
  });

  describe('handleSetDataTodo', () => {
    beforeEach(() => {
      mockModel.todos.some.mockReturnValue(false); 
    });

    it('should add new todo when not in edit mode', async () => {
      await controller.handleSetDataTodo('New task', '2023-01-01');
      
      expect(mockModel.addTodo).toHaveBeenCalledWith('New task', '2023-01-01');
      expect(mockModel.view.clearForm).toHaveBeenCalled();
      expect(mockModel.updateTodo).not.toHaveBeenCalled();
    });

    it('should update todo when in edit mode', async () => {
      mockModel.tempId = 1;
      mockModel.currentId = 1;
      
      await controller.handleSetDataTodo('Updated', '2023-01-02');
      
      expect(mockModel.updateTodo).toHaveBeenCalledWith(1, {
        text: 'Updated',
        date: '2023-01-02'
      });
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith(1);
      expect(mockModel.view.clearForm).toHaveBeenCalled();
      expect(mockModel.addTodo).not.toHaveBeenCalled();
    });

    it('should not add duplicate todo', async () => {
      mockModel.todos.some.mockReturnValue(true); 
      
      await controller.handleSetDataTodo('Test', '2023-01-01');
      
      expect(mockModel.addTodo).not.toHaveBeenCalled();
      expect(mockModel.view.clearForm).toHaveBeenCalled();
    });

    it('should not update duplicate todo', async () => {
      mockModel.tempId = 1;
      mockModel.currentId = 1;
      mockModel.todos.some.mockReturnValue(true); 
      
      await controller.handleSetDataTodo('Test', '2023-01-01');
      
      expect(mockModel.updateTodo).not.toHaveBeenCalled();
      expect(mockModel.view.clearForm).toHaveBeenCalled();
    });
  });

  describe('handleChangeTodo', () => {
    const createMockClassList = (classes) => ({
      contains: (cls) => classes.includes(cls)
    });

    it('should handle toggle action', async () => {
      const classList = createMockClassList(['toggle']);
      await controller.handleChangeTodo('1', classList);
      expect(mockModel.toggleCompleteTodo).toHaveBeenCalledWith('1');
      expect(mockModel.changeEditTodo).not.toHaveBeenCalled();
      expect(mockModel.deleteTodo).not.toHaveBeenCalled();
    });

    it('should handle edit action', async () => {
      const classList = createMockClassList(['edit']);
      await controller.handleChangeTodo('1', classList);
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith('1');
      expect(mockModel.toggleCompleteTodo).not.toHaveBeenCalled();
    });
    
    it('should handle edit action', async () => {
    const classList = createMockClassList(['edit']);
    await controller.handleChangeTodo('1', classList);
    expect(mockModel.changeEditTodo).toHaveBeenCalledWith('1');
    expect(mockModel.toggleCompleteTodo).not.toHaveBeenCalled();
    });

    it('should throw error when filterTodo is missing', () => {
      const brokenModel = {
        ...createMockModel(),
        filterTodo: undefined
      };
  
      expect(() => new TodoController(brokenModel))
        .toThrow('filterTodo method is missing in model');
    });
  });

  describe('handleFilterChange', () => {
    it('should call model.filterTodo with correct filter', () => {
      controller.handleFilterChange('completed');
      expect(mockModel.filterTodo).toHaveBeenCalledWith('completed');
    });

    it('should throw error when filterTodo is missing', () => {
      const brokenModel = {
        ...createMockModel(),
        filterTodo: undefined
      };
    
      expect(() => new TodoController(brokenModel))
        .toThrow('filterTodo method is missing in model');
    });
  });

  describe('getCurrDate', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const date = controller.getCurrDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return valid date string', () => {
      const date = controller.getCurrDate();
      expect(new Date(date)).toBeInstanceOf(Date);  
      expect(new Date(date).toString()).not.toBe('Invalid Date');
    });
  });
});