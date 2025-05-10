import TodoModel from './todo-model.js'
import TodoView from './todo-view.js'
import TodoController from './todo-controller.js'

const controller = new TodoController()
const model = new TodoModel()
const view = new TodoView()
controller.model = model
model.view = view
view.controller = controller

window.onload = () => {
  view.initialize()
  model.initialize()
}
