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