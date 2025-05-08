.PHONY: all install run backend frontend install-backend install-frontend

all: install run
install: install-system install-python install-node install-postgresql configure-db setup-db restart-postgresql install-backend install-frontend 
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
	sudo sed -i 's/local   all             all             peer/local   all             all             md5/' /etc/postgresql/*/main/pg_hba.conf

setup-db:
	@sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='todo_user'" | grep -q 1 || sudo -u postgres psql -c "CREATE USER todo_user WITH PASSWORD 'todo_pass';"
	@sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='todo_db'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE todo_db;"
	@sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;"

restart-postgresql:
	sudo systemctl restart postgresql


install-backend:
	@which sudo >/dev/null || (echo "sudo не найден. Установите его." && exit 1)
	@dpkg -l | grep -q python3-venv || sudo apt-get install -y python3-venv
	@cd backend && test -d venv || python3 -m venv venv
	@cd backend && test -f venv/bin/pip || venv/bin/python -m ensurepip
	@cd backend && venv/bin/pip install --upgrade pip
	@cd backend && venv/bin/pip install uv
	@cd backend && venv/bin/uv sync --active

install-frontend:
	cd frontend && [ -d node_modules ] || npm install

run-backend:
	nohup sh -c 'cd backend && . venv/bin/activate && uv run main.py' > /dev/null 2>&1 &

run-frontend:
	nohup sh -c 'cd frontend && npm start' > /dev/null 2>&1 &