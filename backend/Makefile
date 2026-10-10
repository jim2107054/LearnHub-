.PHONY: setup test test-coverage lint analyse audit fresh up down

setup:
	composer install
	cp -n .env.example .env || true
	php artisan key:generate
	php artisan migrate

test:
	./vendor/bin/pest

test-coverage:
	./vendor/bin/pest --coverage --min=80

lint:
	./vendor/bin/pint

lint-check:
	./vendor/bin/pint --test

analyse:
	./vendor/bin/phpstan analyse --memory-limit=2G

audit:
	composer audit

fresh:
	php artisan migrate:fresh --seed

up:
	docker compose up -d

down:
	docker compose down
