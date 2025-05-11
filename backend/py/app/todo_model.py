from db_init import db_ensure_table

class TodoModel:
    @staticmethod
    def get_all_todos(conn):
        return conn.execute("SELECT * FROM todos ORDER BY id").fetchall()

    @staticmethod
    def add_todo(conn, id, fields):
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO todos (id, text, "dueDate", completed)
                VALUES (%s, %s, %s, %s)
            """, (
                id,
                fields.get("text"),
                fields.get("dueDate"),
                fields.get("completed", False)
            ))
            conn.commit()
        return True

    @staticmethod
    def update_todo(conn, id, fields, updates,):
        with conn.cursor() as cur:
            cur.execute(f"""
                UPDATE todos SET {fields}
                WHERE id = %s
            """, updates + [id])
            conn.commit()
            return cur.rowcount > 0  

    @staticmethod
    def delete_todo(conn, id):
        result = conn.execute("DELETE FROM todos WHERE id = %s", (id,))
        conn.commit()
        return result.rowcount > 0

    @staticmethod
    def ensure_table(conn):
        db_ensure_table(conn)