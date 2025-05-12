import TodoController from '../js/todo-controller.js'
import { jest } from '@jest/globals'

describe('TodoController', () => {
  let controller
  let mockModel

  beforeEach(() => {
    mockModel = {
      todos: [],
      tempId: null,
      currentId: null,
      updateTodo: jest.fn(),
      addTodo: jest.fn(),
      changeEditTodo: jest.fn(),
      toggleCompleteTodo: jest.fn(),
      deleteTodo: jest.fn(),
      filterTodo: jest.fn(),
      view: {
        clearForm: jest.fn(),
      },
    }

    controller = new TodoController()
    controller.model = mockModel
  })

  describe('handleSetDataTodo', () => {
    it('should trim text before processing', async () => {
      await controller.handleSetDataTodo('  test  ', '2023-01-01')
      expect(mockModel.addTodo).toHaveBeenCalledWith('test', '2023-01-01')
    })

    it('should not add duplicate todo (same text and dueDate)', async () => {
      mockModel.todos = [{ text: 'test', dueDate: '2023-01-01' }]
      await controller.handleSetDataTodo('TEST', '2023-01-01')
      expect(mockModel.addTodo).not.toHaveBeenCalled()
    })

    it('should update todo when tempId exists', async () => {
      mockModel.tempId = '123'
      mockModel.currentId = '123'
      await controller.handleSetDataTodo('updated', '2023-01-02')
      expect(mockModel.updateTodo).toHaveBeenCalledWith('123', { text: 'updated', dueDate: '2023-01-02' })
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith('123')
    })

    it('should not update if duplicate exists', async () => {
      mockModel.tempId = '123'
      mockModel.currentId = '123'
      mockModel.todos = [{ text: 'existing', dueDate: '2023-01-01' }]
      await controller.handleSetDataTodo('EXISTING', '2023-01-01')
      expect(mockModel.updateTodo).not.toHaveBeenCalled()
    })

    it('should clear form after operation', async () => {
      await controller.handleSetDataTodo('test', '2023-01-01')
      expect(mockModel.view.clearForm).toHaveBeenCalled()
    })
  })

  describe('handleChangeTodo', () => {
    it('should toggle complete status', async () => {
      await controller.handleChangeTodo('123', { contains: cls => cls === 'toggle' })
      expect(mockModel.toggleCompleteTodo).toHaveBeenCalledWith('123')
    })

    it('should enable edit mode', async () => {
      await controller.handleChangeTodo('123', { contains: cls => cls === 'edit' })
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith('123')
    })

    it('should delete todo', async () => {
      await controller.handleChangeTodo('123', { contains: cls => cls === 'delete' })
      expect(mockModel.deleteTodo).toHaveBeenCalledWith('123')
    })

    it('should exit edit mode before deleting if in edit mode', async () => {
      mockModel.tempId = '123'
      await controller.handleChangeTodo('123', { contains: cls => cls === 'delete' })
      expect(mockModel.changeEditTodo).toHaveBeenCalledWith('123')
      expect(mockModel.deleteTodo).toHaveBeenCalledWith('123')
    })
  })

  describe('handleFilterChange', () => {
    it('should apply filter to model', () => {
      controller.handleFilterChange('completed')
      expect(mockModel.filterTodo).toHaveBeenCalledWith('completed')
    })
  })

  describe('getCurrDate', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const date = controller.getCurrDate()
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      // Проверка, что возвращаемая дата - это сегодня
      const today = new Date().toISOString().split('T')[0]
      expect(date).toBe(today)
    })
  })
})
