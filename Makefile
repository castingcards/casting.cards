.PHONY: deploy-backend deploy-client build-client deploy

deploy-backend:
	@echo "Deploying functions"
	npm run deploy --prefix backend

deploy-client: build-client
	@echo "Deploying client"
	firebase deploy --only hosting

build-client:
	@echo "Building client"
	npm run build --prefix web-client

deploy: deploy-backend deploy-client
	@echo "Deploying to $(DEPLOY_HOST)"

.genfiles/built_backend_deps: backend/functions/package-lock.json
	npm install --prefix backend/functions
	@touch "$@"

.genfiles/built_frontend_deps: web-client/package-lock.json
	npm install --prefix web-client
	@touch "$@"

.PHONY: deps
deps: .genfiles/built_backend_deps .genfiles/built_frontend_deps
