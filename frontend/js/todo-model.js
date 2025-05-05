export default class TodoModel {
  constructor() {
    this.todos = []
    this.currentId = 1
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
    }
    catch {
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

      const response = await fetch('http://127.0.0.1:6432/todos', {
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
    }
    catch {
      throw new Error('Ошибка при добавлении задачи')
    }
  }

  async toggleTodo(id) {
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
      }
      catch {
        throw new Error('Ошибка при обновлении задачи')
      }
    }
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
    }
    catch {
      throw new Error('Ошибка при удалении задачи')
    }
  }

  getTodos(filter = 'all') {
    switch (filter) {
      case 'completed':
        return this.todos.filter(t => t.completed)
      case 'active':
        return this.todos.filter(t => !t.completed)
      default:
        return [...this.todos]
    }
  }
}
