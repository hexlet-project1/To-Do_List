import TodoView from '../js/todo-view.js'

describe('TodoView', () => {
  let view
  let mockController

  beforeEach(() => {
    // Создаем мок-контроллер
    mockController = {
      handleSetDataTodo: jest.fn(),
      handleChangeTodo: jest.fn(),
      handleFilterChange: jest.fn(),
      getCurrDate: jest.fn().mockReturnValue('2023-01-01'),
    }

    // Создаем мок-элементы DOM
    document.body.innerHTML = `
      <div id="task-control-container">
        <form id="todo-form">
          <input id="input-task-name" />
          <input id="input-task-dueDate" type="date" />
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
    it('should set min and max dates for dueDate input', () => {
      expect(view.dueDate.min).toBe('2023-01-01')
      expect(view.dueDate.max).toBe('2999-12-31')
    })

    it('should bind event handlers', () => {
      // Проверяем, что обработчики привязаны
      expect(mockController.handleSetDataTodo).not.toHaveBeenCalled()
      view.form.dispatchEvent(new Event('submit'))
      expect(mockController.handleSetDataTodo).toHaveBeenCalled()

      expect(mockController.handleChangeTodo).not.toHaveBeenCalled()
      view.list.dispatchEvent(new Event('click'))
      expect(mockController.handleChangeTodo).toHaveBeenCalled()

      expect(mockController.handleFilterChange).not.toHaveBeenCalled()
      view.filter.dispatchEvent(new Event('change'))
      expect(mockController.handleFilterChange).toHaveBeenCalled()
    })
  })

  describe('bindSetDataTodo()', () => {
    it('should call handler with trimmed input value and date', () => {
      view.input.value = '  Test task  '
      view.dueDate.value = '2023-01-02'
      view.form.dispatchEvent(new Event('submit'))

      expect(mockController.handleSetDataTodo).toHaveBeenCalledWith('Test task', '2023-01-02')
    })

    it('should prevent default form submission', () => {
      const preventDefault = jest.fn()
      const event = new Event('submit')
      event.preventDefault = preventDefault
      view.form.dispatchEvent(event)
      expect(preventDefault).toHaveBeenCalled()
    })

    describe('bindChangeTodo()', () => {
      it('should call handler with id and classList when clicking on elements', () => {
      // Создаем тестовый элемент в списке
        const li = document.createElement('li')
        li.dataset.id = '1'
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'toggle'
        checkbox.dataset.id = '1'
        li.appendChild(checkbox)
        view.list.appendChild(li)

        // Эмулируем клик на checkbox
        checkbox.dispatchEvent(new Event('click', { bubbles: true }))

        expect(mockController.handleChangeTodo).toHaveBeenCalledWith(1, expect.any(DOMTokenList))
      })
    })

    describe('bindFilterChange()', () => {
      it('should call handler with selected filter value', () => {
        view.filter.value = 'completed'
        view.filter.dispatchEvent(new Event('change'))
        expect(mockController.handleFilterChange).toHaveBeenCalledWith('completed')
      })
    })

    describe('clearForm()', () => {
      it('should clear input and dueDate fields', () => {
        view.input.value = 'Test'
        view.dueDate.value = '2023-01-02'
        view.clearForm()
        expect(view.input.value).toBe('')
        expect(view.dueDate.value).toBe('')
      })
    })

    describe('changeEdit()', () => {
      it('should set edit mode and update form fields', () => {
      // Создаем тестовый элемент в списке
        const li = document.createElement('li')
        li.dataset.id = '1'
        view.list.appendChild(li)

        const todo = {
          id: 1,
          text: 'Edit me',
          dueDate: '2023-01-10',
          completed: false,
        }

        view.changeEdit(todo, true)

        expect(view.input.value).toBe('Edit me')
        expect(view.dueDate.value).toBe('2023-01-10')
        expect(view.editTaskBtn.textContent).toBe('Обновить')
        expect(li.classList.contains('editingElem')).toBe(true)
      })

      it('should exit edit mode and clear form', () => {
        const li = document.createElement('li')
        li.dataset.id = '1'
        view.list.appendChild(li)

        const todo = { id: 1, text: 'Edit me', dueDate: '2023-01-10' }
        view.changeEdit(todo, true)
        view.changeEdit(todo, false)

        expect(view.input.value).toBe('')
        expect(view.dueDate.value).toBe('')
        expect(view.editTaskBtn.textContent).toBe('Добавить')
      })
    })

    describe('renderTodos()', () => {
      it('should render todos correctly', () => {
        const todos = [
          { id: 1, text: 'Task 1', dueDate: '2023-01-02', completed: false },
          { id: 2, text: 'Task 2', dueDate: '2023-01-03', completed: true },
        ]

        view.renderTodos(todos)

        const items = view.list.querySelectorAll('li')
        expect(items.length).toBe(2)

        // Проверяем первый элемент
        const firstItem = items[0]
        expect(firstItem.dataset.id).toBe('1')
        expect(firstItem.querySelector('.todo-text').textContent).toBe('Task 1')
        expect(firstItem.querySelector('.todo-date').textContent).toBe('До 2023-01-02')
        expect(firstItem.querySelector('.toggle').checked).toBe(false)
        expect(firstItem.classList.contains('completed')).toBe(false)

        // Проверяем второй элемент
        const secondItem = items[1]
        expect(secondItem.dataset.id).toBe('2')
        expect(secondItem.querySelector('.todo-text').textContent).toBe('Task 2')
        expect(secondItem.querySelector('.todo-date').textContent).toBe('До 2023-01-03')
        expect(secondItem.querySelector('.toggle').checked).toBe(true)
        expect(secondItem.classList.contains('completed')).toBe(true)
      })

      it('should update existing todos and remove missing ones', () => {
      // Первый рендер
        const initialTodos = [
          { id: 1, text: 'Task 1', dueDate: '2023-01-02', completed: false },
          { id: 2, text: 'Task 2', dueDate: '2023-01-03', completed: false },
        ]
        view.renderTodos(initialTodos)

        // Второй рендер - обновляем первый таск, удаляем второй, добавляем третий
        const updatedTodos = [
          { id: 1, text: 'Updated Task 1', dueDate: '2023-01-05', completed: true },
          { id: 3, text: 'New Task 3', dueDate: '2023-01-04', completed: false },
        ]
        view.renderTodos(updatedTodos)

        const items = view.list.querySelectorAll('li')
        expect(items.length).toBe(2)

        // Проверяем обновленный первый элемент
        const firstItem = items[0]
        expect(firstItem.dataset.id).toBe('1')
        expect(firstItem.querySelector('.todo-text').textContent).toBe('Updated Task 1')
        expect(firstItem.querySelector('.todo-date').textContent).toBe('До 2023-01-05')
        expect(firstItem.querySelector('.toggle').checked).toBe(true)
        expect(firstItem.classList.contains('completed')).toBe(true)

        // Проверяем новый третий элемент
        const secondItem = items[1]
        expect(secondItem.dataset.id).toBe('3')
        expect(secondItem.querySelector('.todo-text').textContent).toBe('New Task 3')
        expect(secondItem.querySelector('.todo-date').textContent).toBe('До 2023-01-04')
        expect(secondItem.querySelector('.toggle').checked).toBe(false)
        expect(secondItem.classList.contains('completed')).toBe(false)
      })
    })
  })
})
