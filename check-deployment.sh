#!/bin/bash
# Quick deployment status check
# Usage: ./check-deployment.sh

echo "🔍 Checking ad-generator deployment status..."
echo ""

# Check if site is accessible
echo "📡 Testing HTTPS connection to ad-generator.mrmidi.net..."
if curl -s -o /dev/null -w "%{http_code}" https://ad-generator.mrmidi.net | grep -q "200"; then
    echo "✅ Site is accessible via HTTPS"
else
    echo "❌ Site not accessible or SSL issue"
fi

echo ""
echo "📋 Recent deployment info:"
echo "Repository: https://github.com/mrmidi/ad-generator"
echo "Actions: https://github.com/mrmidi/ad-generator/actions"
echo ""

# Check GitHub Actions status (requires gh CLI)
if command -v gh &> /dev/null; then
    echo "🚀 Latest GitHub Actions runs:"
    gh run list --limit 3 --repo mrmidi/ad-generator
else
    echo "💡 Install 'gh' CLI to see GitHub Actions status"
fi
