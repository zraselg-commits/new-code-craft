#!/bin/bash
# ============================================================
# Code Craft BD — VPS Deployment Script
# Run this on your VPS after cloning/pulling the repo
# Usage: chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e

echo "🚀 Starting Code Craft BD Deployment..."

# 1. Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install --omit=dev

# 3. Build Next.js app
echo "🔨 Building production bundle..."
npm run build

# 4. Create logs directory
mkdir -p logs

# 5. Restart/start with PM2
echo "♻️  Restarting app with PM2..."
if pm2 list | grep -q "codecraftbd"; then
  pm2 reload ecosystem.config.js --env production
else
  pm2 start ecosystem.config.js --env production
fi

# 6. Save PM2 process list (survives reboots)
pm2 save

echo ""
echo "✅ Deployment complete!"
echo "   App is running at: http://localhost:3000"
echo "   Check logs: pm2 logs codecraftbd"
echo "   Check status: pm2 status"
