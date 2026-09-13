#!/usr/bin/env bash

# Prevent the script from being sourced, which would cause `set -e` and `exit` to close the user's terminal.
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
  echo "Error: This script should not be sourced. Please run it directly using ./deploy-as-databricks-app.sh"
  return 1 2>/dev/null || exit 1
fi

set -e

# Navigate to the root directory of this project
cd "$(dirname "$0")/../.."

if [ ! -f .env ]; then
  echo "Error: .env file not found in dmesh-studio directory!"
  exit 1
fi

source .env

if [ -z "$DATABRICKS_EMAIL" ] || [ -z "$DB_PROFILE" ]; then
  echo "Error: Please ensure DATABRICKS_EMAIL and DB_PROFILE are set in your .env file."
  exit 1
fi

if [ -z "$API_APP_URL" ]; then
  echo "Error: Please ensure API_APP_URL is set in your .env file."
  exit 1
fi

# Create a clean deployment folder to avoid syncing unnecessary files
DEPLOY_DIR=$(mktemp -d)
trap 'rm -rf "$DEPLOY_DIR"' EXIT

echo "=========================================="
echo " 0. Preparing Backend Files"
echo "=========================================="
# Copy base backend files
cp -R backend/base/* "$DEPLOY_DIR/"

# Overlay custom backend files if they exist
if [ -d "backend/custom" ] && [ "$(ls -A backend/custom 2>/dev/null)" ]; then
  cp -R backend/custom/* "$DEPLOY_DIR/"
fi

# Parameterize app.yaml
if [ -f "$DEPLOY_DIR/app.yaml" ]; then
  sed "s|\${API_APP_URL}|${API_APP_URL}|g" "$DEPLOY_DIR/app.yaml" > "$DEPLOY_DIR/app.yaml.tmp"
  mv "$DEPLOY_DIR/app.yaml.tmp" "$DEPLOY_DIR/app.yaml"
fi


echo "=========================================="
echo " 1. Building Vite React App"
echo "=========================================="
cd frontend
npm install
npm run build
cd ..

echo "=========================================="
echo " 2. Syncing to Databricks Workspace"
echo "=========================================="
# Ensure app exists silently
if ! databricks apps get dmesh-studio --profile "$DB_PROFILE" >/dev/null 2>&1; then
  echo "Creating new Databricks App: dmesh-studio..."
  databricks apps create dmesh-studio --profile "$DB_PROFILE"
fi

cp -R frontend/dist "$DEPLOY_DIR/"

echo "Cleaning up remote workspace directory to ensure no unnecessary files remain..."
databricks workspace delete "/Workspace/Users/$DATABRICKS_EMAIL/dmesh-studio" --recursive --profile "$DB_PROFILE" 2>/dev/null || true
databricks workspace mkdirs "/Workspace/Users/$DATABRICKS_EMAIL/dmesh-studio" --profile "$DB_PROFILE" 2>/dev/null || true

databricks sync "$DEPLOY_DIR" "/Workspace/Users/$DATABRICKS_EMAIL/dmesh-studio" --profile "$DB_PROFILE"

echo "=========================================="
echo " 3. Deploying Databricks App"
echo "=========================================="
databricks apps deploy dmesh-studio --source-code-path "/Workspace/Users/$DATABRICKS_EMAIL/dmesh-studio" --profile "$DB_PROFILE"

echo "Deployment complete! You can view the status in the Databricks UI."
