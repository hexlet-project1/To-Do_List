.PHONY: all install run backend frontend install-backend install-frontend

all: install run
install: install-backend install-frontend
run: run-backend run-frontend

install-backend:
	@which sudo || (echo "sudo не найден. Установите его." && exit 1)
	@dpkg -l | grep -q python3-venv || sudo apt-get install -y python3-venv
	@test -d backend/venv || python3 -m venv backend/venv
	@. backend/venv/bin/activate && cd backend && uv sync --active

install-frontend:
	cd frontend && [ -d node_modules ] || npm install

run-backend:
	nohup sh -c 'cd backend && . venv/bin/activate && python3 main.py' > /dev/null 2>&1 &

run-frontend:
	nohup sh -c 'cd frontend && npm start' > /dev/null 2>&1 &