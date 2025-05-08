def ensure_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            text TEXT,
            "dueDate" TEXT,
            completed BOOLEAN DEFAULT FALSE
        )
    """)
