import pytest
from unittest.mock import MagicMock
from backend.py.app.todo_model import TodoModel

@pytest.fixture
def mock_conn():
    conn = MagicMock()
    # Для методов, использующих прямое conn.execute()
    conn.execute.return_value.rowcount = 1
    conn.execute.return_value.fetchall.return_value = []
    
    # Для методов, использующих курсор через with
    cursor = MagicMock()
    cursor.__enter__.return_value = cursor
    cursor.__exit__.return_value = False
    conn.cursor.return_value = cursor
    return conn

def test_get_all_todos(mock_conn):
    # Настройка тестовых данных
    mock_data = [{"id": 1, "text": "Test 1"}, {"id": 2, "text": "Test 2"}]
    mock_conn.execute.return_value.fetchall.return_value = mock_data
    
    # Вызов метода
    result = TodoModel.get_all_todos(mock_conn)
    
    # Проверки
    mock_conn.execute.assert_called_once_with("SELECT * FROM todos ORDER BY id")
    assert result == mock_data

def test_add_todo(mock_conn):
    # Подготовка данных
    test_id = 1
    test_fields = {
        "text": "New task",
        "dueDate": "2023-12-31",
        "completed": False
    }
    
    # Вызов метода
    result = TodoModel.add_todo(mock_conn, test_id, test_fields)
    
    # Проверки
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    
    # Получаем фактический вызов execute
    actual_call_args = mock_cursor.execute.call_args[0]
    actual_sql = actual_call_args[0]
    actual_params = actual_call_args[1]
    
    # Проверяем основные компоненты SQL
    assert "INSERT INTO todos (id, text, \"dueDate\", completed)" in actual_sql
    assert "VALUES (%s, %s, %s, %s)" in actual_sql
    assert actual_params == (test_id, "New task", "2023-12-31", False)
    mock_conn.commit.assert_called_once()
    assert result is True

def test_update_todo_success(mock_conn):
    # Настройка курсора для with-блока
    mock_cursor = mock_conn.cursor.return_value.__enter__.return_value
    mock_cursor.rowcount = 1
    
    # Вызов метода
    result = TodoModel.update_todo(
        mock_conn, 
        1, 
        "text = %s, completed = %s", 
        ["Updated text", True]
    )
    
    # Проверки
    actual_call_args = mock_cursor.execute.call_args[0]
    actual_sql = actual_call_args[0]
    actual_params = actual_call_args[1]
    
    assert "UPDATE todos SET" in actual_sql
    assert "WHERE id = %s" in actual_sql
    assert actual_params == ["Updated text", True, 1]
    mock_conn.commit.assert_called_once()
    assert result is True

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