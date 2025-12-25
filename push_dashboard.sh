#!/bin/bash

echo "📦 PUSHING MASTER DASHBOARD"
echo "==========================="
echo ""

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "Initializing git in gml-workspace..."
    git init
    git branch -M main
fi

# Add the dashboard
git add GML_MASTER_DASHBOARD.html

# Also add any other new files from today
git add -A

# Commit
git commit -m "Add GML Master Dashboard - Complete ecosystem control center

✅ Shows all 12 GML applications
✅ Status indicators for new/enhanced apps
✅ Quick launch buttons for each app
✅ Today's achievements highlighted
✅ Keyboard shortcuts (1-9) for quick access
✅ Beautiful gradient design
✅ Links to GitHub repos

Dashboard Features:
- RiffGen, TriadGen, Quartet Engine, Quintet Composer
- GCC Module 1, Drum Engine
- Composer/Guitar Profiles
- Infinite Riff Machine
- Enhancement Suite with Template System
- Shows Sept 18 updates: Templates, VoiceLeading.js, GCC"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/mikeb55/gml-workspace.git
fi

# Push
echo "Pushing to GitHub..."
if git push origin main 2>/dev/null; then
    echo "✅ Dashboard pushed successfully!"
elif git push origin master 2>/dev/null; then
    echo "✅ Dashboard pushed to master!"
elif git push -u origin main 2>/dev/null; then
    echo "✅ Dashboard pushed (new branch)!"
else
    echo "⚠️  Need to create repo on GitHub first:"
    echo "   1. Go to: https://github.com/new"
    echo "   2. Name: gml-workspace"
    echo "   3. Create (no README)"
    echo "   4. Run: git push -u origin main"
fi

echo ""
echo "🎉 Master Dashboard saved!"
echo "📍 Location: gml-workspace/GML_MASTER_DASHBOARD.html"
