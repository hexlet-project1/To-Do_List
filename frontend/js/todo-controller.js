export default class TodoController {
  async handleSetDataTodo(text, dueDate) {
    const trimmedText = text.trim()
    const isDuplicate = this.model.todos.some(
      todo => todo.text.toLowerCase() === trimmedText.toLowerCase() && todo.dueDate === dueDate,
    )
    if (this.model.tempId) {
      const id = this.model.currentId
      if (!isDuplicate) {
        await this.model.updateTodo(id, { text: trimmedText, dueDate }) // Исправлено: используем trimmedText
      }
      this.model.changeEditTodo(id)
    }
    else {
      if (!isDuplicate) {
        await this.model.addTodo(trimmedText, dueDate) // Исправлено: используем trimmedText
      }
    }
    this.model.view.clearForm()
  }

  async handleChangeTodo(id, classList) {
    if (classList.contains('toggle')) await this.model.toggleCompleteTodo(id)
    if (classList.contains('edit')) await this.model.changeEditTodo(id)
    if (classList.contains('delete')) {
      if (this.model.tempId !== null) {
        await this.model.changeEditTodo(id)
      }
      await this.model.deleteTodo(id)
    }
  }

  async handleFilterChange(filter) {
    this.model.filterTodo(filter)
  }

  getCurrDate() {
    return new Date().toISOString().split('T')[0]
  }
}
