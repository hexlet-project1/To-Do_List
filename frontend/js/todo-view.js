export default class TodoView {
  constructor() {
    const taskControlContainer = document.getElementById('task-control-container')
    this.form = taskControlContainer.querySelector('#todo-form')
    this.input = this.form.querySelector('#input-task-name')
    this.dueDate = this.form.querySelector('#input-task-dueDate')
    this.editTaskBtn = this.form.querySelector('#editTaskBtn')
    this.list = taskControlContainer.querySelector('#todo-list')
    this.filter = taskControlContainer.querySelector('#todo-filter')
    this.error = taskControlContainer.querySelector('#error-message')
  }

  initialize() {
    this.bindSetDataTodo(this.controller.handleSetDataTodo.bind(this.controller))
    this.bindToggleCompleteTodo(this.controller.handleToggleCompleteTodo.bind(this.controller))
    this.bindDeleteTodo(this.controller.handleDeleteTodo.bind(this.controller))
    this.bindFilterChange(this.controller.handleFilterChange.bind(this.controller))
    this.bindEditTodo(this.controller.handleEditTodo.bind(this.controller))
    this.dueDate.min = this.controller.getDate()
    this.dueDate.max = '2999-12-31'
  }

  bindSetDataTodo(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()
      const id = e.target.dataset.id ?? null
      const text = this.input.value.trim()
      const date = this.dueDate.value
      handler(id, text, date)
    })
  }

  bindToggleCompleteTodo(handler) {
    this.list.addEventListener('click', (e) => {
      const classList = e.target.classList
      const id = Number(e.target.dataset.id)
      handler(id, classList)
    })
  }

  bindDeleteTodo(handler) {
    this.list.addEventListener('click', (e) => {
      const classList = e.target.classList
      const id = Number(e.target.dataset.id)
      handler(id, classList)
    })
  }

  bindFilterChange(handler) {
    this.filter.addEventListener('change', () => {
      handler(this.filter.value)
    })
  }

  bindEditTodo(handler) {
    this.list.addEventListener('click', (e) => {
      const classList = e.target.classList
      const id = Number(e.target.dataset.id)
      handler(id, classList)
    })
  }

  clearForm() {
    this.input.value = ''
    this.dueDate.value = ''
  }

  changeEdit(todo, isPrecious) {
    const li = this.list.querySelector(`li[data-id="${todo.id}"]`)
    if (isPrecious) {
      li.classList.add('focusedTodo')
      this.input.value = ''
      this.dueDate.value = ''
      this.editTaskBtn.textContent = 'Добавить'
    }
    else {
      li.classList.remove('focusedTodo')
      this.input.value = todo.text
      this.dueDate.value = todo.dueDate
      this.editTaskBtn.textContent = 'Обновить'
    }
  }

  renderTodos(todos) {
    const renderedIds = new Set()

    for (const todo of todos) {
      let li = this.list.querySelector(`li[data-id="${todo.id}"]`)

      if (!li) {
        li = document.createElement('li')
        li.dataset.id = todo.id

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'toggle'
        checkbox.dataset.id = todo.id
        checkbox.style.transform = 'scale(1.3)'

        const content = document.createElement('div')
        content.className = 'todo-content'

        const text = document.createElement('span')
        text.className = 'todo-text'

        const date = document.createElement('span')
        date.className = 'todo-date'

        content.appendChild(text)
        content.appendChild(date)

        const editBtn = document.createElement('button')
        editBtn.textContent = '✎'
        editBtn.className = 'edit'
        editBtn.dataset.id = todo.id

        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Удалить'
        deleteBtn.className = 'delete'
        deleteBtn.dataset.id = todo.id

        li.appendChild(checkbox)
        li.appendChild(content)
        li.appendChild(editBtn)
        li.appendChild(deleteBtn)

        this.list.appendChild(li)
      }

      li.querySelector('.toggle').checked = todo.completed
      li.querySelector('.todo-text').textContent = todo.text
      li.querySelector('.todo-date').textContent = `До ${todo.dueDate}`
      li.classList.toggle('completed', todo.completed)

      renderedIds.add(todo.id)
    }

    for (const li of this.list.querySelectorAll('li')) {
      if (!renderedIds.has(Number(li.dataset.id))) {
        this.list.removeChild(li)
      }
    }
  }
}
