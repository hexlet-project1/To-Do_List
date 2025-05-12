import pytest
from unittest.mock import MagicMock, patch
from flask import Flask
from backend.py.app.todo_controller import TodoController 

@pytest.fixture
def app():
    app = Flask(__name__)
    app.testing = True
    return app

@pytest.fixture
def mock_conn():
    return MagicMock()

@pytest.fixture
def mock_todo_model():
    model = MagicMock()
    model.get_all_todos.return_value = [{'id': 1, 'text': 'Test todo'}]
    model.add_todo.return_value = True
    model.update_todo.return_value = True
    model.delete_todo.return_value = True
    return model

@pytest.fixture
def controller(mock_todo_model, mock_conn):
    with patch('backend.py.app.todo_controller.db_get_connection', return_value=mock_conn):
        with patch('backend.py.app.todo_controller.db_ensure_table'):
            return TodoController(conn=mock_conn, todo_model=mock_todo_model)

def test_prepare_data(controller):
    data = {'text': 'Test', 'dueDate': '2023-01-01', 'invalid': 'should be ignored'}
    fields, values = controller.prepare_data(data)
    assert fields == '"text" = %s, "dueDate" = %s'
    assert values == ['Test', '2023-01-01']
    
    data = {'invalid': 'should be ignored'}
    fields, values = controller.prepare_data(data)
    assert fields is None
    assert values is None

def test_get_todos(controller, app):
    with app.test_request_context('/todos'):
        response = controller.get_todos()
        assert response[1] == 200
        assert response[0].json == [{'id': 1, 'text': 'Test todo'}]
        controller.todo_model.get_all_todos.assert_called_once_with(controller.conn)

def test_add_todo_success(controller, app):
    test_data = {'text': 'New todo', 'completed': False}
    with app.test_request_context('/todos/1', json=test_data):
        response = controller.add_todo(1)
        assert response[1] == 201
        assert response[0] == ''
        controller.todo_model.add_todo.assert_called_once_with(controller.conn, 1, {'text': 'New todo', 'completed': False})

def test_add_todo_failure(controller, app):
    controller.todo_model.add_todo.return_value = False
    test_data = {'text': 'New todo'}
    with app.test_request_context('/todos/1', json=test_data):
        response = controller.add_todo(1)
        assert response[1] == 500
        assert response[0].json == {"error": "Не удалось добавить в базу данных"}

def test_update_todo_success(controller, app):
    test_data = {'text': 'Updated todo', 'completed': True}
    with app.test_request_context('/todos/1', json=test_data):
        response = controller.update_todo(1)
        assert response[1] == 200
        assert response[0] == ''
        controller.todo_model.update_todo.assert_called_once()

def test_update_todo_no_valid_fields(controller, app):
    test_data = {'invalid': 'field'}
    with app.test_request_context('/todos/1', json=test_data):
        response = controller.update_todo(1)
        assert response[1] == 400
        assert response[0].json == {"error": "Нет валидных значений"}

def test_update_todo_not_found(controller, app):
    controller.todo_model.update_todo.return_value = False
    test_data = {'text': 'Updated todo'}
    with app.test_request_context('/todos/1', json=test_data):
        response = controller.update_todo(1)
        assert response[1] == 404
        assert response[0].json == {"error": "Задача не найдена"}

def test_delete_todo_success(controller, app):
    with app.test_request_context('/todos/1'):
        response = controller.delete_todo(1)
        assert response[1] == 204
        assert response[0] == ''
        controller.todo_model.delete_todo.assert_called_once_with(controller.conn, 1)

def test_delete_todo_not_found(controller, app):
    controller.todo_model.delete_todo.return_value = False
    with app.test_request_context('/todos/1'):
        response = controller.delete_todo(1)
        assert response[1] == 404
        assert response[0].json == {'error': 'Задача не найдена'}

def test_register_routes(controller):
    app = Flask(__name__)
    app.register_blueprint(controller.blueprint)
    
    rules = {rule.endpoint: rule for rule in app.url_map.iter_rules()}
    
    assert 'todo_controller.get_todos' in rules
    assert 'GET' in rules['todo_controller.get_todos'].methods
    assert rules['todo_controller.get_todos'].rule == '/todos'
    
    assert 'todo_controller.add_todo' in rules
    assert 'POST' in rules['todo_controller.add_todo'].methods
    assert rules['todo_controller.add_todo'].rule == '/todos/<int:id>'
    
    assert 'todo_controller.update_todo' in rules
    assert 'PUT' in rules['todo_controller.update_todo'].methods
    assert rules['todo_controller.update_todo'].rule == '/todos/<int:id>'
    
    assert 'todo_controller.delete_todo' in rules
    assert 'DELETE' in rules['todo_controller.delete_todo'].methods
    assert rules['todo_controller.delete_todo'].rule == '/todos/<int:id>'