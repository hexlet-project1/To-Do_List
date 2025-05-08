export default class TodoController {
  async handleSetDataTodo(id, text, date) {
    const trimmedText = text.trim()
    const isDuplicate = this.model.todos.some(
      todo => todo.text.toLowerCase() === trimmedText.toLowerCase() && todo.dueDate === date,
    )
    if (!isDuplicate) {
      if (this.model.editingId) {
        await this.model.updateTodo(id, text, date)
      }
      else {
        await this.model.addTodo(text, date)
      }
    }
    else {
      this.model.view.clearForm()
    }
  }

  async handleToggleCompleteTodo(id, classList) {
    if (classList.contains('toggle')) await this.model.toggleCompleteTodo(id)
  }

  async handleDeleteTodo(id, classList) {
    if (classList.contains('delete')) await this.model.deleteTodo(id)
  }

  handleFilterChange(filter) {
    this.model.changeFilter(filter)
  }

  async handleEditTodo(id, classList) {
    if (classList.contains('edit')) this.model.changeEditTodo(id)
  }

  getDate() {
    return new Date().toISOString().split('T')[0]
  }
}
