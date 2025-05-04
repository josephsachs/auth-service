#!/bin/bash

# Exit on error
set -e

APP_DIR="$(pwd)"
DIST_DIR="$APP_DIR/dist"
TEMP_DIR="$APP_DIR/temp_build"
PACKAGE_NAME="auth-service.zip"

echo "Starting build and package process..."

echo "Cleaning previous build..."
rm -rf "$DIST_DIR" "$TEMP_DIR" "$PACKAGE_NAME"
npm run clean

echo "Installing dependencies..."
npm ci

echo "Building TypeScript app..."
npm run build

echo "Creating package structure..."
mkdir -p "$TEMP_DIR"

echo "Copying build artifacts..."
cp -r "$DIST_DIR" "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"

echo "Creating data directory..."
mkdir -p "$TEMP_DIR/data"

echo "Installing production dependencies..."
cd "$TEMP_DIR"
npm ci --only=production

echo "Removing unnecessary files..."
rm -rf node_modules/.cache
rm -rf node_modules/.bin
find node_modules -name "*.d.ts" -type f -delete
find node_modules -name "*.md" -type f -delete
find node_modules -name "LICENSE" -type f -delete
find node_modules -name "CHANGELOG*" -type f -delete
find node_modules -name "README*" -type f -delete
find node_modules -type d -name "test" -exec rm -rf {} +
find node_modules -type d -name "tests" -exec rm -rf {} +
find node_modules -type d -name "docs" -exec rm -rf {} +
find node_modules -type d -name "example" -exec rm -rf {} +
find node_modules -type d -name "examples" -exec rm -rf {} +

echo "Creating ZIP package..."
cd "$TEMP_DIR"
zip -r "$APP_DIR/$PACKAGE_NAME" .

echo "Cleaning up..."
cd "$APP_DIR"
rm -rf "$TEMP_DIR"

echo "Package created: $PACKAGE_NAME"
echo "Done!"