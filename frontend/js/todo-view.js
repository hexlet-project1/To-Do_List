export default class TodoView {
  constructor() {
    const taskControlContainer = document.getElementById('task-control-container')
    this.form = taskControlContainer.querySelector('#todo-form')
    this.input = this.form.querySelector('#input-task-name')
    this.dueDate = this.form.querySelector('#input-task-dueDate')
    this.list = taskControlContainer.querySelector('#todo-list')
    this.filter = taskControlContainer.querySelector('#todo-filter')
    this.error = taskControlContainer.querySelector('#error-message')
  }

  initialize() {
    const today = new Date().toISOString().split('T')[0]
    this.dueDate.min = today
    this.dueDate.max = '2999-12-31'
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()
      const text = this.input.value.trim()
      const date = this.dueDate.value
      handler(text, date)
    })
  }

  bindToggleTodo(handler) {
    this.list.addEventListener('click', (e) => {
      if (e.target.classList.contains('toggle')) {
        const id = Number(e.target.dataset.id)
        handler(id)
      }
    })
  }

  bindDeleteTodo(handler) {
    this.list.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete')) {
        const id = Number(e.target.dataset.id)
        handler(id)
      }
    })
  }

  bindFilterChange(handler) {
    this.filter.addEventListener('change', () => {
      handler(this.filter.value)
    })
  }

  clearForm() {
    this.input.value = ''
    this.dueDate.value = ''
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

        const deleteBtn = document.createElement('button')
        deleteBtn.textContent = 'Удалить'
        deleteBtn.className = 'delete'
        deleteBtn.dataset.id = todo.id

        li.appendChild(checkbox)
        li.appendChild(content)
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
