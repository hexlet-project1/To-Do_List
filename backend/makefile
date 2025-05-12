.PHONY: all setup run ruff ruff-fix check pytest prepare

all: setup run

setup: setup-base
	.venv/bin/uv sync --active

setup-production: setup-base
	.venv/bin/uv sync --active --no-dev

setup-base:
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

pytest:
	uv run pytest

safe-tests:
	@if [ "$(cmd)" = "pytest" ]; then \
  	uv run pytest || [ $$? -eq 5 ]; \
 	else \
  	uv run $(cmd); \
 	fi

check: ruff pytest

prepare: ruff-fix