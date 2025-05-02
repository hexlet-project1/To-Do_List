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

jest:
	NODE_OPTIONS=--experimental-vm-modules npx jest

prepare: lint-fix prettier-fix

push:
	@cd .. && \
	branch=$$(git symbolic-ref --short HEAD); \
	remote=$$(git remote show | head -n1); \
	echo "Текущая ветка: $$branch"; \
	echo "Удалённый репозиторий: $$remote"; \
	if git ls-remote --exit-code --heads $$remote $$branch > /dev/null; then \
  	echo "Удалённая ветка существует."; \
	else \
  	echo "ВНИМАНИЕ: Ветка '$$branch' не найдена на удалённом репозитории '$$remote'."; \
  	read -p "Создать новую удалённую ветку при push? [y/n]: " create; \
  	if [ "$$create" != "y" ] && [ "$$create" != "Y" ]; then \
   		echo "Операция отменена."; exit 1; \
  	fi; \
	fi; \
	read -p "Продолжить push/pull на $$remote/$$branch? [y/n]: " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
  	git pull $$remote $$branch || echo "pull пропущен (возможно, ветка новая)"; \
  	git push -u $$remote $$branch; \
 	else \
  	echo "Операция отменена."; \
	fi