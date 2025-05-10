.PHONY: all setup run ruff ruff-fix check pytest prepare

all: setup run

setup:
	[ -d .venv ] || python3 -m venv .venv
	. .venv/bin/activate && \
	pip install --upgrade pip && \
	pip install uv && \
	.venv/bin/uv sync --active

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