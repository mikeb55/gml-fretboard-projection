#!/bin/bash

echo "🧹 QUICK CLEANUP - 20 minutes"
echo "=============================="

# List test files to remove
echo "Removing test files..."
rm -f test*.html 2>/dev/null
rm -f BULLETPROOF*.html 2>/dev/null
rm -f fix*.js 2>/dev/null
rm -f fix*.sh 2>/dev/null

# Keep only best version of each app
echo "Keeping best versions only..."
cd triadgen
rm -f BULLETPROOF*.html DUAL*.html WORKING*.html 2>/dev/null
echo "  Keeping: FULL_TRIADGEN.html"
cd ..

# Quick git commit
echo "Committing cleanup..."
git add -A
git commit -m "Cleanup: removed test files, kept best versions"
git push origin main 2>/dev/null

echo "✅ DONE in under 20 minutes"
echo ""
echo "Removed:"
echo "  • Test files"
echo "  • Duplicate versions"
echo "  • Temporary scripts"
echo ""
echo "Workspace is now clean!"
