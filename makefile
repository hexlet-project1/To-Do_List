.PHONY: all install run backend frontend install-backend install-frontend

all: install run
install: install-backend install-frontend
run: run-frontend


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