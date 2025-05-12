.PHONY: all setup-production setup-base run

all: setup run

setup-production: setup-base
	.venv/bin/uv sync --active --no-dev

setup-base:
	[ -d .venv ] || python3 -m venv .venv
	. .venv/bin/activate && \
	pip install --upgrade pip && \
	pip install uv
 
run:
	uv run main.py
