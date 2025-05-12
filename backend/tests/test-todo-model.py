import pytest
from unittest.mock import MagicMock, patch
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
    expected_sql = """
                INSERT INTO todos (id, text, "dueDate", completed)
                VALUES (%s, %s, %s, %s)
            """
    mock_cursor.execute.assert_called_once_with(
        expected_sql.strip(),
        (test_id, "New task", "2023-12-31", False)
    )
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
    expected_sql = """
                UPDATE todos SET text = %s, completed = %s
                WHERE id = %s
            """
    mock_cursor.execute.assert_called_once_with(
        expected_sql.strip(),
        ["Updated text", True, 1]
    )
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