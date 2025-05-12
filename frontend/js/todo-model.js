export default class TodoModel {
  constructor() {
    this.todos = []
    this.currentId = 1
    this.tempId = null
    this.filter = 'all'
  }

  async initialize() {
    await this.fetchTodos()
  }

  async fetchTodos() {
    try {
      const response = await fetch('http://127.0.0.1:6432/todos')
      if (!response.ok) {
        throw new Error('Не удалось получить задачи с сервера')
      }
      const todos = await response.json()
      Object.values(todos).forEach((value) => {
        this.todos.push(value)
      })
      if (this.todos.length > 0) {
        this.currentId = Math.max(...this.todos.map(t => t.id)) + 1
      }
      this.view.renderTodos(this.getTodos())
    }
    catch {
      // доп обработка
      throw new Error('Ошибка при загрузке задач с сервера')
    }
  }

  async addTodo(text, dueDate) {
    try {
      const newTodo = {
        id: this.currentId,
        text,
        dueDate,
        completed: false,
      }

      const response = await fetch(`http://127.0.0.1:6432/todos/${this.currentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      })

      if (!response.ok) {
        throw new Error('Не удалось добавить задачу на сервер')
      }
      this.currentId += 1
      this.todos.push(newTodo)
      this.view.clearForm()
      this.view.renderTodos(this.getTodos())
    }
    catch {
      // доп обработка
      throw new Error('Ошибка при добавлении задачи')
    }
  }

  async toggleCompleteTodo(id) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      try {
        const fetchBody = { completed: !todo.completed }
        const response = await fetch(`http://127.0.0.1:6432/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fetchBody),
        })

        if (!response.ok) {
          throw new Error('Не удалось обновить задачу на сервере')
        }
        todo.completed = !todo.completed
        this.view.renderTodos(this.getTodos())
      }
      catch {
        throw new Error('Ошибка при обновлении задачи')
      }
    }
  }

  changeEditTodo(id) {
    if (this.tempId !== null && id === this.currentId) {
      this.currentId = this.tempId
      this.tempId = null
    }
    else {
      if (this.tempId === null) this.tempId = this.currentId
      this.currentId = id
    }
    const todo = this.todos.find(t => t.id === id)
    this.view.changeEdit(todo, this.tempId !== null)
  }

  async deleteTodo(id) {
    try {
      const response = await fetch(`http://127.0.0.1:6432/todos/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Не удалось удалить задачу на сервере')
      }
      this.todos = this.todos.filter(t => t.id !== id)
      this.view.renderTodos(this.getTodos())
    }
    catch {
      // доп обработка
      throw new Error('Ошибка при удалении задачи')
    }
  }

  filterTodo(filter) {
    this.filter = filter
    this.view.renderTodos(this.getTodos())
  }

  async updateTodo(id, fetchBody) {
    try {
      const response = await fetch(`http://127.0.0.1:6432/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fetchBody),
      })
      if (!response.ok) {
        throw new Error('Не удалось обновить задачу на сервере')
      }
      const itemI = this.todos.findIndex(t => t.id === id)
      this.todos[itemI] = { ...this.todos[itemI], ...fetchBody }
      this.view.clearForm()
      this.view.renderTodos(this.getTodos())
    }
    catch {
      // доп обработка
      throw new Error('Ошибка при обновлении задачи')
    }
  }

  getTodos() {
    switch (this.filter) {
      case 'completed':
        return this.todos.filter(t => t.completed)
      case 'active':
        return this.todos.filter(t => !t.completed)
      default:
        return [...this.todos]
    }
  }

  setEditingId(id) {
    this.editingId = id
  }
}
