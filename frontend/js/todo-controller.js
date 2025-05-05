export default class TodoController {
  constructor(model, view) {
    this.model = model
    this.view = view
    this.filter = 'all'
  }

  initialize() {
    this.view.initialize()
    this.view.renderTodos(this.model.getTodos())
    this.view.bindAddTodo(this.handleAddTodo.bind(this))
    this.view.bindToggleTodo(this.handleToggleTodo.bind(this))
    this.view.bindDeleteTodo(this.handleDeleteTodo.bind(this))
    this.view.bindFilterChange(this.handleFilterChange.bind(this))
    this.loadTodos()
  }

  async handleAddTodo(text, date) {
    const trimmedText = text.trim()
    const isDuplicate = this.model.todos.some(
      todo => todo.text.toLowerCase() === trimmedText.toLowerCase() && todo.dueDate === date,
    )
    if (!isDuplicate) {
      await this.model.addTodo(trimmedText, date)
    }
    this.view.clearForm()
    this.updateView()
  }

  async handleToggleTodo(id) {
    await this.model.toggleTodo(id)
    this.updateView()
  }

  async handleDeleteTodo(id) {
    await this.model.deleteTodo(id)
    this.updateView()
  }

  handleFilterChange(filter) {
    this.filter = filter
    this.updateView()
  }

  async loadTodos() {
    try {
      await this.model.fetchTodos()
      this.view.renderTodos(this.model.getTodos())
    }
    catch {
      throw new Error('Не удалось загрузить todos...')
    }
  }

  updateView() {
    const todos = this.model.getTodos(this.filter)
    this.view.renderTodos(todos)
  }
}
