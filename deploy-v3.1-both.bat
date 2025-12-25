@echo off
echo ========================================
echo V3.1 Deployment - Unlimited Measures
echo Quartet & Quintet Engines
echo ========================================
echo.

echo [1/4] Deploying Quartet V3.1...
cd /d "C:\Users\mike\Documents\gml-workspace\gml-quartet-v2"
echo Current directory: %CD%
git add quartet-v3.1.html
git commit -m "V3.1 - Added unlimited measures functionality (1-100 measures)"
git push origin main
echo Quartet V3.1 deployed!
echo.

echo [2/4] Deploying Quintet V3.1...
cd /d "C:\Users\mike\Documents\gml-workspace\quintet-composer"
echo Current directory: %CD%
git add quintet-v3.1.html
git commit -m "V3.1 - Added unlimited measures functionality (1-100 measures)"
git push origin main
echo Quintet V3.1 deployed!
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Quartet V3.1: https://github.com/mikeb55/gml-quartet-v2
echo Quintet V3.1: https://github.com/mikeb55/gml-quintet-composer
echo.
echo New Features in V3.1:
echo - Unlimited measures (1-100)
echo - Visual progress bar during playback
echo - Measure-by-measure display
echo - Scrollable measures view
echo - Export includes all measures
echo.
pause