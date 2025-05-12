setup:
	npm ci

setup-production:
	npm install --omit=dev

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

jest:
	NODE_OPTIONS=--experimental-vm-modules npx jest

safe-tests:
	@if ! npm run | grep -q "$(cmd)"; then \
  	echo "No such npm script: $(cmd). Failing."; \
  	exit 1; \
 	fi
	npm run $(cmd)

check: prettier lint jest

prepare: lint-fix prettier-fix