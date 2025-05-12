import pytest
from unittest.mock import MagicMock
from backend.py.app.todo_model import TodoModel

@pytest.fixture
def mock_conn():
    conn = MagicMock()
    cursor = MagicMock()
    cursor.__enter__.return_value = cursor
    cursor.__exit__.return_value = False
    conn.cursor.return_value = cursor
    return conn

def test_get_all_todos(mock_conn):
    mock_data = [{"id": 1, "text": "Test 1"}, {"id": 2, "text": "Test 2"}]
    mock_conn.execute.return_value.fetchall.return_value = mock_data
    result = TodoModel.get_all_todos(mock_conn)
    assert "SELECT * FROM todos" in mock_conn.execute.call_args[0][0]
    assert result == mock_data

def test_add_todo(mock_conn):
    mock_conn.cursor.return_value.__enter__.return_value.fetchone.return_value = (1,)
    result = TodoModel.add_todo(mock_conn, 1, {"text": "Test"})
    assert "INSERT INTO todos" in mock_conn.cursor.return_value.__enter__.return_value.execute.call_args[0][0]
    assert result is True

def test_update_todo(mock_conn):
    mock_conn.cursor.return_value.__enter__.return_value.rowcount = 1
    result = TodoModel.update_todo(mock_conn, 1, "text = %s", ["Test"])
    assert "UPDATE todos" in mock_conn.cursor.return_value.__enter__.return_value.execute.call_args[0][0]
    assert result is True

def test_delete_todo(mock_conn):
    mock_conn.cursor.return_value.__enter__.return_value.rowcount = 1
    result = TodoModel.delete_todo(mock_conn, 1)
    assert "DELETE FROM todos" in mock_conn.cursor.return_value.__enter__.return_value.execute.call_args[0][0]
    assert result is True