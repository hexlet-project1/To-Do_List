PG_CMD = sudo -u postgres -H

.PHONY: all setup run install-system install-python install-node install-postgresql configure-db setup-db restart-postgresql install-backend install-frontend run-backend run-frontend

all: setup run

setup: install configure-db restart-postgresql setup-db

install: install-system install-python install-node install-backend install-frontend install-postgresql

run: run-frontend

install-system:
	sudo apt-get update && sudo apt-get install -y curl git build-essential

install-python:
	sudo apt-get install -y python3 python3-pip python3-venv

install-node:
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$$HOME/.nvm" && \
  . "$$NVM_DIR/nvm.sh" && \
  nvm install --lts && nvm use --lts

install-postgresql:
	sudo apt-get update
	sudo apt-get install -y postgresql postgresql-contrib

configure-db:
	sudo sed -i 's/^\(local\s\+all\s\+all\s\+\)peer/\1md5/' /etc/postgresql/*/main/pg_hba.conf || true

restart-postgresql:
	sudo systemctl restart postgresql
	sleep 2

setup-db:
	$(PG_CMD) psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='todo_user'" | grep -q 1 || \
	$(PG_CMD) psql -c "CREATE USER todo_user WITH PASSWORD 'todo_pass';"
	$(PG_CMD) psql -tAc "SELECT 1 FROM pg_database WHERE datname='todo_db'" | grep -q 1 || \
	$(PG_CMD) psql -c "CREATE DATABASE todo_db OWNER todo_user;"
	$(PG_CMD) psql -c "GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;"

install-backend:
	cd backend && \
	make setup-production

install-frontend:
	cd frontend && [ -d node_modules ] || make setup-production

run-backend:
	nohup sh -c 'cd backend && . .venv/bin/activate && uv run main.py' > /dev/null 2>&1 &

run-frontend:
	nohup sh -c 'cd frontend && npm start' > /dev/null 2>&1 &
