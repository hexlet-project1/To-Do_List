from flask import Blueprint, request, jsonify

class TodoController:
    def __init__(self, todo_model, conn):
        self.conn = conn
        self.blueprint = Blueprint('todo_controller', __name__)
        self.register_routes()
        self.allowed_fields = ['id', 'text', 'dueDate', 'completed']
        self.todo_model = todo_model

    def prepare_data(self, data):
        filtered = {key: data[key] for key in data if key in self.allowed_fields}
        if not filtered:
            return None, None
        fields = ', '.join(f"{field} = %s" for field in filtered)
        values = list(filtered.values())
        return fields, values
    
    def get_todos(self):
        todos = self.todo_model.get_all_todos(self.conn)
        return jsonify(todos), 200

    def add_todo(self, id):
        data = request.json
        filtered = {key: data[key] for key in data if key in self.allowed_fields}
        if not self.todo_model.add_todo(self.conn, id, filtered):
            return jsonify({"error":'Не удалось добавить в базу данных'}), 500
        return '', 201

    def update_todo(self, id):
        print(self, id)
        data = request.json
        fields, values = self.prepare_data(data)
        if not fields:
            return jsonify({"error": "Нет валидных значений"}), 400
        if not self.todo_model.update_todo(self.conn, id, fields, values):
            return jsonify({"error": "Задача не найдена"}), 404
        return '', 200

    def delete_todo(self, id):
        if not self.todo_model.delete_todo(self.conn, id):
            return jsonify({'error': 'Задача не найдена'}), 404
        return '', 204

    def register_routes(self):
        self.blueprint.add_url_rule('/todos', view_func=self.get_todos, methods=['GET'])
        self.blueprint.add_url_rule('/todos/<int:id>', view_func=self.add_todo, methods=['POST'])
        self.blueprint.add_url_rule('/todos/<int:id>', view_func=self.update_todo, methods=['PUT'])
        self.blueprint.add_url_rule('/todos/<int:id>', view_func=self.delete_todo, methods=['DELETE'])