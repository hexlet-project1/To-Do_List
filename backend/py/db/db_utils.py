import psycopg
from psycopg.rows import dict_row
from db_config import DB_CONFIG

def db_ensure_table(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id SERIAL PRIMARY KEY,
            text TEXT,
            "dueDate" TEXT,
            completed BOOLEAN DEFAULT FALSE
        )
    """)

def db_get_connection():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row)