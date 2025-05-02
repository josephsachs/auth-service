#!/bin/bash

# Exit on error
set -e

# Set variables
APP_DIR="$(pwd)"
DIST_DIR="$APP_DIR/dist"
TEMP_DIR="$APP_DIR/temp_build"
PACKAGE_NAME="auth-service.zip"

echo "Starting build and package process..."

# Clean previous build artifacts
echo "Cleaning previous build..."
rm -rf "$DIST_DIR" "$TEMP_DIR" "$PACKAGE_NAME"
npm run clean

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the app
echo "Building TypeScript app..."
npm run build

# Create temp directory for packaging
echo "Creating package structure..."
mkdir -p "$TEMP_DIR"

# Copy necessary files to temp directory
echo "Copying build artifacts..."
cp -r "$DIST_DIR" "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"

# Create data directory
echo "Creating data directory..."
mkdir -p "$TEMP_DIR/data"

# Install production dependencies in temp directory
echo "Installing production dependencies..."
cd "$TEMP_DIR"
npm ci --only=production

# Clean up unnecessary files
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

# Create the zip package
echo "Creating ZIP package..."
cd "$TEMP_DIR"
zip -r "$APP_DIR/$PACKAGE_NAME" .

# Clean up
echo "Cleaning up..."
cd "$APP_DIR"
rm -rf "$TEMP_DIR"

echo "Package created: $PACKAGE_NAME"
echo "Done!"