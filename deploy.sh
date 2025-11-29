#!/bin/bash

# Wissen Publication Group - Deployment Script
# This script builds and deploys the application

echo "🚀 Starting deployment process..."

# Step 1: Build Backend
echo "📦 Building backend..."
cd backend
npm install
npm run build
cd ..

# Step 2: Build Frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Step 3: Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://wissen-publication-group.web.app"

