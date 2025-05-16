import psycopg
from psycopg.rows import dict_row
from db_config import DB_CONFIG

BACKUP_DIR = "./backups"
DB_NAME = DB_CONFIG.db_name
DB_USER = DB_CONFIG.user
DB_PASS = DB_CONFIG.password

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

def create_backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"{BACKUP_DIR}/backup_{timestamp}.sql"

    cmd = [
        "pg_dump",
        "-U", DB_USER,
        "-F", "c",
        "-f", backup_file,
        DB_NAME
    ]

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASS
    
    try:
        subprocess.run(cmd, check=True, env=env)
    except subprocess.CalledProcessError:
        pass

def get_latest_backup():
    files = [f for f in os.listdir(BACKUP_DIR) if f.endswith(".sql")]
    if not files:
        return None
    return os.path.join(BACKUP_DIR, sorted(files)[-1])

def restore_backup():
    backup_file = get_latest_backup()
    if not backup_file:
        return

    cmd = [
        "pg_restore",
        "-U", DB_USER,
        "-d", DB_NAME,
        "--clean",
        backup_file
    ]

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASS

    try:
        subprocess.run(cmd, check=True, env=env)
    except subprocess.CalledProcessError:
        pass

def recover_if_broken():
    try:
        with db_get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM todos LIMIT 1;")
    except Exception as e:
        restore_backup()

if __name__ == "__main__":
    recover_if_broken()
    create_backup()
