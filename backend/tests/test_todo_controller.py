import pytest
from unittest.mock import patch, MagicMock
from backend.py.app.todo_controller import todo_controller
from flask import Flask

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(todo_controller)
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def mock_conn():
    conn = MagicMock()
    cursor = MagicMock()
    cursor.__enter__.return_value = cursor
    cursor.__exit__.return_value = False
    conn.cursor.return_value = cursor
    return conn

def test_get_todos(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.get_all_todos', return_value=[{"id": 1, "text": "Test"}]):
        response = client.get('/todos')
        assert response.status_code == 200
        assert response.json == [{"id": 1, "text": "Test"}]

def test_add_todo(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.add_todo', return_value=True):
        response = client.post('/todos/1', json={"text": "New task"})
        assert response.status_code == 201

def test_add_todo_failure(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.add_todo', return_value=False):
        response = client.post('/todos/1', json={"text": "New task"})
        assert response.status_code == 500
        assert response.json == {"error": "Не удалось добавить в базу данных"}

def test_update_todo(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.update_todo', return_value=True):
        response = client.put('/todos/1', json={"text": "Updated task"})
        assert response.status_code == 200

def test_update_todo_not_found(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.update_todo', return_value=False):
        response = client.put('/todos/1', json={"text": "Updated task"})
        assert response.status_code == 404
        assert response.json == {"error": "Задача не найдена"}

def test_delete_todo(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.delete_todo', return_value=True):
        response = client.delete('/todos/1')
        assert response.status_code == 204

def test_delete_todo_not_found(client, mock_conn):
    with patch('backend.py.app.todo_controller.TodoModel.delete_todo', return_value=False):
        response = client.delete('/todos/1')
        assert response.status_code == 404
        assert response.json == {"error": "Задача не найдена"}