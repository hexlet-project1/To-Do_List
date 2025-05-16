import TodoModel from '../js/todo-model.js'
import { jest } from '@jest/globals'

// Мокаем глобальный fetch
global.fetch = jest.fn()

describe('TodoModel', () => {
  let model
  let mockView

  beforeEach(() => {
    // Создаем мок представления
    mockView = {
      renderTodos: jest.fn(),
      clearForm: jest.fn(),
      changeEdit: jest.fn(),
    }

    model = new TodoModel()
    model.view = mockView
    fetch.mockClear()
  })

  describe('Initialization', () => {
    it('should initialize with empty todos and default values', () => {
      expect(model.todos).toEqual([])
      expect(model.currentId).toBe(1)
      expect(model.tempId).toBeNull()
      expect(model.filter).toBe('all')
    })
  })

  describe('Data operations', () => {
    describe('fetchTodos()', () => {
      it('should successfully fetch and process todos', async () => {
        const mockData = {
          1: { id: 1, text: 'Task 1', completed: false },
          2: { id: 2, text: 'Task 2', completed: true },
        }

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        })

        await model.fetchTodos()

        expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:6432/todos')
        expect(model.todos).toEqual(Object.values(mockData))
        expect(model.currentId).toBe(3) // Следующий ID после максимального
        expect(mockView.renderTodos).toHaveBeenCalledWith(model.todos)
      })

      it('should handle empty response', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })

        await model.fetchTodos()
        expect(model.todos).toEqual([])
        expect(model.currentId).toBe(1) // Остается по умолчанию
      })

      it('should throw error on failed fetch', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'))
        await expect(model.fetchTodos()).rejects.toThrow('Ошибка при загрузке задач с сервера')
      })

      it('should throw error on non-ok response', async () => {
        fetch.mockResolvedValueOnce({ ok: false })
        await expect(model.fetchTodos()).rejects.toThrow('Ошибка при загрузке задач с сервера')
      })
    })

    describe('addTodo()', () => {
      it('should add new todo and update server', async () => {
        const newTodo = {
          id: 1,
          text: 'New task',
          dueDate: '2023-01-01',
          completed: false,
        }

        fetch.mockResolvedValueOnce({ ok: true })

        await model.addTodo('New task', '2023-01-01')

        expect(fetch).toHaveBeenCalledWith(
          'http://127.0.0.1:6432/todos/1',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(newTodo),
          }),
        )
        expect(model.todos).toContainEqual(newTodo)
        expect(model.currentId).toBe(2)
        expect(mockView.clearForm).toHaveBeenCalled()
        expect(mockView.renderTodos).toHaveBeenCalled()
      })

      it('should handle add error', async () => {
        fetch.mockResolvedValueOnce({ ok: false })
        await expect(model.addTodo('Fail')).rejects.toThrow('Ошибка при добавлении задачи')
      })
    })

    describe('toggleCompleteTodo()', () => {
      beforeEach(() => {
        model.todos = [
          { id: 1, text: 'Task 1', completed: false },
          { id: 2, text: 'Task 2', completed: true },
        ]
      })

      it('should toggle completion status', async () => {
        fetch.mockResolvedValueOnce({ ok: true })
        await model.toggleCompleteTodo(1)

        expect(fetch).toHaveBeenCalledWith(
          'http://127.0.0.1:6432/todos/1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ completed: true }),
          }),
        )
        expect(model.todos[0].completed).toBe(true)
        expect(mockView.renderTodos).toHaveBeenCalled()
      })

      it('should do nothing for non-existent todo', async () => {
        await model.toggleCompleteTodo(99)
        expect(fetch).not.toHaveBeenCalled()
      })

      it('should handle toggle error', async () => {
        fetch.mockResolvedValueOnce({ ok: false })
        await expect(model.toggleCompleteTodo(1)).rejects.toThrow('Ошибка при обновлении задачи')
      })
    })

    describe('deleteTodo()', () => {
      beforeEach(() => {
        model.todos = [
          { id: 1, text: 'Task 1' },
          { id: 2, text: 'Task 2' },
        ]
      })

      it('should delete todo successfully', async () => {
        fetch.mockResolvedValueOnce({ ok: true })
        await model.deleteTodo(1)

        expect(fetch).toHaveBeenCalledWith(
          'http://127.0.0.1:6432/todos/1',
          { method: 'DELETE' },
        )
        expect(model.todos).toHaveLength(1)
        expect(mockView.renderTodos).toHaveBeenCalled()
      })

      it('should handle delete error', async () => {
        fetch.mockResolvedValueOnce({ ok: false })
        await expect(model.deleteTodo(1)).rejects.toThrow('Ошибка при удалении задачи')
      })
    })

    describe('updateTodo()', () => {
      beforeEach(() => {
        model.todos = [
          { id: 1, text: 'Old text', dueDate: '2023-01-01', completed: false },
        ]
      })

      it('should update todo successfully', async () => {
        fetch.mockResolvedValueOnce({ ok: true })
        const updates = { text: 'New text', dueDate: '2023-01-02' }

        await model.updateTodo(1, updates)

        expect(fetch).toHaveBeenCalledWith(
          'http://127.0.0.1:6432/todos/1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updates),
          }),
        )
        expect(model.todos[0]).toEqual({
          id: 1,
          text: 'New text',
          dueDate: '2023-01-02',
          completed: false,
        })
        expect(mockView.clearForm).toHaveBeenCalled()
        expect(mockView.renderTodos).toHaveBeenCalled()
      })

      it('should handle update error', async () => {
        fetch.mockResolvedValueOnce({ ok: false })
        await expect(model.updateTodo(1, {})).rejects.toThrow('Ошибка при обновлении задачи')
      })
    })
  })

  describe('Edit operations', () => {
    beforeEach(() => {
      model.todos = [
        { id: 1, text: 'Task 1' },
        { id: 2, text: 'Task 2' },
      ]
    })

    describe('changeEditTodo()', () => {
      it('should enter edit mode', () => {
        model.changeEditTodo(1)
        expect(model.tempId).toBe(1)
        expect(model.currentId).toBe(1)
        expect(mockView.changeEdit).toHaveBeenCalledWith(
          { id: 1, text: 'Task 1' },
          true,
        )
      })

      it('should exit edit mode when toggling same todo', () => {
        model.changeEditTodo(1)
        model.changeEditTodo(1)

        expect(model.tempId).toBeNull()
        expect(model.currentId).toBe(1)
        expect(mockView.changeEdit).toHaveBeenCalledWith(
          { id: 1, text: 'Task 1' },
          false,
        )
      })

      it('should switch editing between todos', () => {
        model.changeEditTodo(1)
        model.changeEditTodo(2)

        expect(model.tempId).toBe(1)
        expect(model.currentId).toBe(2)
        expect(mockView.changeEdit).toHaveBeenCalledWith(
          { id: 2, text: 'Task 2' },
          true,
        )
      })
    })
  })

  describe('Filter operations', () => {
    beforeEach(() => {
      model.todos = [
        { id: 1, text: 'Active', completed: false },
        { id: 2, text: 'Completed', completed: true },
      ]
    })

    describe('filterTodo()', () => {
      it('should filter by active tasks', () => {
        model.filterTodo('active')
        expect(model.filter).toBe('active')
        expect(mockView.renderTodos).toHaveBeenCalledWith([
          { id: 1, text: 'Active', completed: false },
        ])
      })

      it('should filter by completed tasks', () => {
        model.filterTodo('completed')
        expect(model.filter).toBe('completed')
        expect(mockView.renderTodos).toHaveBeenCalledWith([
          { id: 2, text: 'Completed', completed: true },
        ])
      })

      it('should show all tasks', () => {
        model.filterTodo('all')
        expect(model.filter).toBe('all')
        expect(mockView.renderTodos).toHaveBeenCalledWith(model.todos)
      })
    })

    describe('getTodos()', () => {
      it('should return filtered todos', () => {
        model.filter = 'active'
        expect(model.getTodos()).toEqual([
          { id: 1, text: 'Active', completed: false },
        ])

        model.filter = 'completed'
        expect(model.getTodos()).toEqual([
          { id: 2, text: 'Completed', completed: true },
        ])

        model.filter = 'all'
        expect(model.getTodos()).toEqual(model.todos)
      })
    })
  })
})
