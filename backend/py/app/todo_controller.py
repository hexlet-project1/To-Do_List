from flask import Blueprint, request, jsonify
from todo_model import TodoModel
from db_utils import get_connection
from db_init import ensure_table

ensure_table(get_connection())
todo_controller = Blueprint('todo_controller', __name__)
allowed_fields = ['id', 'text', 'dueDate', 'completed']
conn = get_connection()

def prepare_data(data):
    filtered = {key: data[key] for key in data if key in allowed_fields}
    if not filtered:
        return None, None
    fields = ', '.join(f"{field} = %s" for field in filtered)
    values = list(filtered.values())
    return fields, values

@todo_controller.route('/todos', methods=['GET'])
def get_todos():
    todos = TodoModel.get_all_todos(conn)
    return jsonify(todos), 200

@todo_controller.route('/todos/<int:id>', methods=['POST'])
def add_todo(id):
    data = request.json
    filtered = {key: data[key] for key in data if key in allowed_fields}
    if not TodoModel.add_todo(conn, id, filtered):
        return jsonify({"error":'Не удалось добавить в базу данных'}), 500
    return '', 201

@todo_controller.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    data = request.json
    fields, values = prepare_data(data)
    if not fields:
        return jsonify({"error": "Нет валидных значений"}), 400
    if not TodoModel.update_todo(conn, id, fields, values):
        return jsonify({"error": "Задача не найдена"}), 404
    return '', 200

@todo_controller.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    if not TodoModel.delete_todo(conn,id):
        return jsonify({'error': 'Задача не найдена'}), 404
    return '', 204