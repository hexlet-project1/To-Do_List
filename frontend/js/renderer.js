import TodoModel from './todo-model.js'
import TodoView from './todo-view.js'
import TodoController from './todo-controller.js'

const model = new TodoModel()
const view = new TodoView()
const controller = new TodoController(model, view)

window.onload = () => {
  controller.initialize()
}
