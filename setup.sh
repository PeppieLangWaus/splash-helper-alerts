#!/bin/bash

# Quick setup script for splash-helper-alerts
# Run: bash setup.sh

set -e

echo "🎮 Splash Helper - Quick Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env from template
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✓ .env created - please edit with your values:"
    echo "  1. JOIN_API_KEY - Get from your Join app"
    echo "  2. JOIN_DEVICE_ID - Usually 'group.all'"
    echo "  3. (Optional) ACCOUNT_FILTER_NAMES - Your character names"
else
    echo "✓ .env already exists"
fi

# Create logs directory
mkdir -p logs

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your Join API key:"
echo "   nano .env   (or your favorite editor)"
echo ""
echo "2. Start the server:"
echo "   npm run dev    (development)"
echo "   npm start      (production)"
echo ""
echo "3. Test the webhook:"
echo "   curl http://localhost:3000/health"
echo ""
echo "4. In Dink plugin settings, set webhook URL to:"
echo "   http://localhost:3000/webhook/dink"
echo ""
echo "5. Deploy to cloud (see DEPLOYMENT.md for options):"
echo "   - Railway (easiest)"
echo "   - Heroku"
echo "   - AWS Lambda"
echo "   - Docker on VPS"
echo ""
