.PHONY: all setup-production setup-base run

all: setup run

setup:
	[ -d .venv ] || python3 -m venv .venv
	. .venv/bin/activate && \
	pip install --upgrade pip && \
	pip install uv
 
run:
	uv run main.py

ruff:
	uv run ruff check

ruff-fix:
	uv run ruff check --fix

check: ruff

pytest:
	uv run pytest

prepare: ruff-fix