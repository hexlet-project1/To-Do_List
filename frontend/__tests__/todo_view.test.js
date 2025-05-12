/**
 * @jest-environment jsdom
 */
import TodoView from '../js/todo-view.js'
import { jest } from '@jest/globals'

describe('TodoView', () => {
  let view
  let mockController

  beforeEach(() => {
    // Создаем мок контроллера
    mockController = {
      handleSetDataTodo: jest.fn(),
      handleChangeTodo: jest.fn(),
      handleFilterChange: jest.fn(),
      getCurrDate: jest.fn().mockReturnValue('2023-01-01'),
    }

    // Создаем тестовый DOM
    document.body.innerHTML = `
      <div id="task-control-container">
        <form id="todo-form">
          <input id="input-task-name" type="text">
          <input id="input-task-dueDate" type="date">
          <button id="editTaskBtn">Добавить</button>
        </form>
        <ul id="todo-list"></ul>
        <select id="todo-filter">
          <option value="all">Все</option>
          <option value="completed">Выполненные</option>
          <option value="active">Активные</option>
        </select>
        <div id="error-message"></div>
      </div>
    `

    view = new TodoView()
    view.controller = mockController
    view.initialize()
  })

  describe('initialize()', () => {
    it('should set min and max date for dueDate input', () => {
      expect(view.dueDate.min).toBe('2023-01-01')
      expect(view.dueDate.max).toBe('2999-12-31')
    })
  })

  describe('bindSetDataTodo()', () => {
    it('should call handler with input values on form submit', () => {
      view.input.value = 'Test task'
      view.dueDate.value = '2023-12-31'

      const submitEvent = new Event('submit')
      view.form.dispatchEvent(submitEvent)

      expect(mockController.handleSetDataTodo).toHaveBeenCalledWith('Test task', '2023-12-31')
    })

    it('should prevent default form submission', () => {
      const submitEvent = new Event('submit')
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault')

      view.form.dispatchEvent(submitEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('bindChangeTodo()', () => {
    it('should call handler with id and classList when clicking on list item', () => {
    // Добавляем тестовый элемент в список
      document.getElementById('todo-list').innerHTML = `
      <li data-id="1">
        <input type="checkbox" class="toggle" data-id="1">
        <button class="edit" data-id="1">✎</button>
        <button class="delete" data-id="1">Удалить</button>
      </li>
    `

      // Симулируем клик на чекбоксе
      const checkbox = document.querySelector('.toggle')
      const clickEvent = new MouseEvent('click', {
        bubbles: true, // Важно для всплытия события
        cancelable: true,
      })

      // Создаем spy на classList
      const classListSpy = jest.spyOn(checkbox.classList, 'contains')

      checkbox.dispatchEvent(clickEvent)

      // Проверяем что обработчик вызван с правильными аргументами
      expect(mockController.handleChangeTodo).toHaveBeenCalledWith(
        1, // ожидаемый id
        expect.objectContaining({
        // Проверяем что это DOMTokenList (classList)
          contains: expect.any(Function),
          toggle: expect.any(Function),
        // другие методы classList при необходимости
        }),
      )

      classListSpy.mockRestore()
    })
  })

  describe('clearForm()', () => {
    it('should clear input and dueDate fields', () => {
      view.input.value = 'Test task'
      view.dueDate.value = '2023-12-31'

      view.clearForm()

      expect(view.input.value).toBe('')
      expect(view.dueDate.value).toBe('')
    })
  })

  describe('changeEdit()', () => {
    it('should set edit mode when isPrecious is true', () => {
      // Добавляем тестовый элемент в список
      document.getElementById('todo-list').innerHTML = `
        <li data-id="1">
          <span>Test task</span>
        </li>
      `

      const todo = {
        id: 1,
        text: 'Test task',
        dueDate: '2023-12-31',
      }

      view.changeEdit(todo, true)

      const li = document.querySelector('li[data-id="1"]')
      expect(li.classList.contains('editingElem')).toBe(true)
      expect(view.input.value).toBe('Test task')
      expect(view.dueDate.value).toBe('2023-12-31')
      expect(view.editTaskBtn.textContent).toBe('Обновить')
    })

    it('should exit edit mode when isPrecious is false', () => {
      // Добавляем тестовый элемент в список
      document.getElementById('todo-list').innerHTML = `
        <li data-id="1" class="editingElem">
          <span>Test task</span>
        </li>
      `

      const todo = {
        id: 1,
        text: 'Test task',
        dueDate: '2023-12-31',
      }

      view.input.value = 'Test task'
      view.dueDate.value = '2023-12-31'
      view.editTaskBtn.textContent = 'Обновить'

      view.changeEdit(todo, false)

      const li = document.querySelector('li[data-id="1"]')
      expect(li.classList.contains('editingElem')).toBe(false)
      expect(view.input.value).toBe('')
      expect(view.dueDate.value).toBe('')
      expect(view.editTaskBtn.textContent).toBe('Добавить')
    })
  })

  describe('renderTodos()', () => {
    it('should render todos correctly', () => {
      const todos = [
        { id: 1, text: 'Task 1', dueDate: '2023-01-01', completed: false },
        { id: 2, text: 'Task 2', dueDate: '2023-01-02', completed: true },
      ]

      view.renderTodos(todos)

      const items = document.querySelectorAll('#todo-list li')
      expect(items.length).toBe(2)

      // Проверяем первый элемент
      const firstItem = items[0]
      expect(firstItem.dataset.id).toBe('1')
      expect(firstItem.querySelector('.todo-text').textContent).toBe('Task 1')
      expect(firstItem.querySelector('.todo-date').textContent).toBe('До 2023-01-01')
      expect(firstItem.querySelector('.toggle').checked).toBe(false)
      expect(firstItem.classList.contains('completed')).toBe(false)

      // Проверяем второй элемент
      const secondItem = items[1]
      expect(secondItem.dataset.id).toBe('2')
      expect(secondItem.querySelector('.todo-text').textContent).toBe('Task 2')
      expect(secondItem.querySelector('.todo-date').textContent).toBe('До 2023-01-02')
      expect(secondItem.querySelector('.toggle').checked).toBe(true)
      expect(secondItem.classList.contains('completed')).toBe(true)
    })

    it('should remove todos that are not in the list', () => {
      // Сначала добавляем элемент
      document.getElementById('todo-list').innerHTML = `
        <li data-id="1">
          <span>Old task</span>
        </li>
      `

      const todos = [
        { id: 2, text: 'New task', dueDate: '2023-01-01', completed: false },
      ]

      view.renderTodos(todos)

      const items = document.querySelectorAll('#todo-list li')
      expect(items.length).toBe(1)
      expect(items[0].dataset.id).toBe('2')
    })

    it('should update existing todos instead of creating new ones', () => {
      const todos = [
        { id: 1, text: 'Task 1', dueDate: '2023-01-01', completed: false },
      ]

      view.renderTodos(todos)
      const firstRenderCount = document.querySelectorAll('#todo-list li').length

      // Обновляем ту же задачу
      todos[0].text = 'Updated Task 1'
      view.renderTodos(todos)
      const secondRenderCount = document.querySelectorAll('#todo-list li').length

      expect(firstRenderCount).toBe(1)
      expect(secondRenderCount).toBe(1)
      expect(document.querySelector('.todo-text').textContent).toBe('Updated Task 1')
    })
  })
})
