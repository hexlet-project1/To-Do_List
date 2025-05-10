setup:
	npm ci

run:
	npm start

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

prettier:
	npx prettier . --check

prettier-fix:
	npx prettier . --write

check: prettier lint

jest:
	NODE_OPTIONS=--experimental-vm-modules npx jest

prepare: lint-fix prettier-fix