import pytest
from unittest.mock import MagicMock
from backend.py.app.todo_model import TodoModel

@pytest.fixture
def mock_conn():
    conn = MagicMock()
    conn.execute.return_value.rowcount = 1
    conn.execute.return_value.fetchall.return_value = []
    
    cursor = MagicMock()
    cursor.__enter__.return_value = cursor
    cursor.__exit__.return_value = False
    conn.cursor.return_value = cursor
    return conn

def test_get_all_todos(mock_conn):
    mock_data = [{"id": 1, "text": "Test 1"}, {"id": 2, "text": "Test 2"}]
    mock_conn.execute.return_value.fetchall.return_value = mock_data
    
    result = TodoModel.get_all_todos(mock_conn)
    
    mock_conn.execute.assert_called_once_with("SELECT * FROM todos ORDER BY id")
    assert result == mock_data

def test_add_todo(mock_conn):
    test_id = 1
    test_fields = {
        "text": "New task",
        "dueDate": "2023-12-31",
        "completed": False
    }
    
    result = TodoModel.add_todo(mock_conn, test_id, test_fields)
    
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    
    actual_sql = mock_cursor.execute.call_args[0][0]
    assert "INSERT INTO todos (id, text, \"dueDate\", completed)" in actual_sql
    assert "VALUES (%s, %s, %s, %s)" in actual_sql
    
    assert mock_cursor.execute.call_args[0][1] == (test_id, "New task", "2023-12-31", False)
    
    mock_conn.commit.assert_called_once()
    assert result is True

def test_update_todo_success(mock_conn):
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    mock_cursor.rowcount = 1
    
    result = TodoModel.update_todo(
        mock_conn,
        1,
        "text = %s, completed = %s",
        ["Updated text", True]
    )
    
    actual_sql = mock_cursor.execute.call_args[0][0]
    assert "UPDATE todos SET text = %s, completed = %s" in actual_sql
    assert "WHERE id = %s" in actual_sql
    
    assert mock_cursor.execute.call_args[0][1] == ["Updated text", True, 1]
    
    mock_conn.commit.assert_called_once()
    assert result is True

def test_update_todo_not_found(mock_conn):
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    mock_cursor.rowcount = 0
    
    result = TodoModel.update_todo(
        mock_conn,
        999,
        "text = %s",
        ["Updated text"]
    )
    assert result is False

def test_delete_todo_success(mock_conn):
    mock_conn.execute.return_value.rowcount = 1
    
    result = TodoModel.delete_todo(mock_conn, 1)
    
    mock_conn.execute.assert_called_once_with(
        "DELETE FROM todos WHERE id = %s", 
        (1,)
    )
    mock_conn.commit.assert_called_once()
    assert result is True

def test_delete_todo_not_found(mock_conn):
    mock_conn.execute.return_value.rowcount = 0
    
    result = TodoModel.delete_todo(mock_conn, 999)
    assert result is False