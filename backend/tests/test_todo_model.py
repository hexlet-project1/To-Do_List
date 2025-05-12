import pytest
from unittest.mock import patch, MagicMock
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
    mock_data = [
        {"id": 1, "text": "Test 1", "dueDate": "2025-01-01", "completed": False},
        {"id": 2, "text": "Test 2", "dueDate": "2025-02-01", "completed": True},
    ]
    
    mock_conn.execute.return_value.fetchall.return_value = mock_data
    result = TodoModel.get_all_todos(mock_conn)
    
    executed_sql = mock_conn.execute.call_args[0][0].strip()
    assert "SELECT * FROM todos ORDER BY id" in executed_sql
    assert result == mock_data

def test_add_todo(mock_conn):
    mock_cur = mock_conn.cursor.return_value.__enter__.return_value
    mock_cur.fetchone.return_value = (1,)

    fields = {"text": "New task", "dueDate": "2025-01-01", "completed": False}
    assert TodoModel.add_todo(mock_conn, 1, fields) is True

    sql = mock_cur.execute.call_args[0][0].strip()
    assert "INSERT INTO todos" in sql
    assert mock_cur.execute.call_args[0][1] == (1, "New task", "2025-01-01", False)
    mock_conn.commit.assert_called_once()

def test_update_todo(mock_conn):
    mock_cur = mock_conn.cursor.return_value.__enter__.return_value
    mock_cur.rowcount = 1

    fields = "text = %s, completed = %s"
    updates = ["Updated task", True]
    assert TodoModel.update_todo(mock_conn, 1, fields, updates) is True

    sql = mock_cur.execute.call_args[0][0].strip()
    assert "UPDATE todos SET" in sql
    assert mock_cur.execute.call_args[0][1] == ["Updated task", True, 1]
    mock_conn.commit.assert_called_once()

def test_delete_todo(mock_conn):
    mock_conn.execute.return_value.rowcount = 1
    assert TodoModel.delete_todo(mock_conn, 1) is True
    
    assert mock_conn.execute.call_args[0][0].strip() == "DELETE FROM todos WHERE id = %s"
    assert mock_conn.execute.call_args[0][1] == (1,)
    mock_conn.commit.assert_called_once()