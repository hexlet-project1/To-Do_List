from flask import Flask, jsonify, request

app = Flask(__name__)

allowed_fields = ['id', 'text', 'dueDate', 'completed']

todos = [{"text": "5555","id": 1,
        "dueDate":"202",
        "completed": False}, {"text": "11111", "id": 2,
        "dueDate":"2021",
        "completed": True}]

@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(todos)

@app.route('/todos', methods=['POST'])
def add_todo():
    new_todo = request.json
    filtered_todo = {key: new_todo[key] for key in allowed_fields if key in new_todo}
    todos.append(filtered_todo)
    return '', 201

@app.route('/todos/<int:id>', methods=['PUT'])
def update_todo(id):
    updated_todo = request.json
    for todo in todos:
        if todo["id"] == id:
            for field in allowed_fields:
                if field in updated_todo and updated_todo[field] is not None:
                    todo[field] = updated_todo[field]
                    print(todo)
            return '', 200
    return jsonify({"error": "Task not found"}), 404

@app.route('/todos/<int:id>', methods=['DELETE'])
def delete_todo(id):
    global todos
    filtered_todos = [todo for todo in todos if todo["id"] != id]
    if len(filtered_todos) == len(todos):
        return jsonify({"error": "Task not found"}), 404
    todos = filtered_todos
    return '', 204 

if __name__ == '__main__':
    app.run(port=6432)
    