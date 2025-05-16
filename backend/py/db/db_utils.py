import psycopg
from psycopg.rows import dict_row
from db_config import DB_CONFIG

def db_ensure_table(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                text VARCHAR(30) NOT NULL,
                "dueDate" DATE NOT NULL,
                completed BOOLEAN DEFAULT FALSE
            )
        """)
    conn.commit()

def db_get_connection():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row)