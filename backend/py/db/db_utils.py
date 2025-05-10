import psycopg
from psycopg.rows import dict_row
from db_config import DB_CONFIG

def get_connection():
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row)