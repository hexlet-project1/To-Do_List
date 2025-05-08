class TodoModel:

    @classmethod
    def get_all_todos(cls, conn):
        return conn.execute("SELECT * FROM todos ORDER BY id").fetchall()

    @classmethod
    def add_todo(cls, conn, id, fields):
        with conn.cursor() as cur:
            print(                id,
                fields.get("text"),
                fields.get("dueDate"),
                fields.get("completed", False))
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

    @classmethod
    def update_todo(cls, conn, id, fields, updates,):
        with conn.cursor() as cur:
            print(fields, updates, id)
            cur.execute(f"""
                UPDATE todos SET {fields}
                WHERE id = %s
            """, updates + [id])
            conn.commit()
            return cur.rowcount > 0  

    @classmethod
    def delete_todo(cls,conn, id):
        result = conn.execute("DELETE FROM todos WHERE id = %s", (id,))
        return result.rowcount > 0