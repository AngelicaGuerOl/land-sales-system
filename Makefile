.PHONY: dev up build ps logs logs-frontend down restart-frontend rebuild-frontend stop

COMPOSE = docker compose -f docker-compose.yml -f docker-compose.dev.yml

dev:
	$(COMPOSE) --profile tools up -d db pgadmin
	$(COMPOSE) up -d --no-deps frontend

up:
	$(COMPOSE) up -d

build:
	$(COMPOSE) build

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

logs-frontend:
	$(COMPOSE) logs -f frontend

down:
	$(COMPOSE) down

restart-frontend:
	$(COMPOSE) up -d --force-recreate frontend

rebuild-frontend:
	$(COMPOSE) build frontend
	$(COMPOSE) up -d --force-recreate frontend

stop:
	$(COMPOSE) stop
