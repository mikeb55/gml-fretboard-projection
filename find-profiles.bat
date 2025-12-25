@echo off
echo Finding all profile files...
echo.

echo Checking main location:
cd /d "C:\Users\mike\Documents\gml-workspace\gml-composer-profiles-extension"
echo.
dir /s *profile*.* 
echo.
echo Checking git status:
git status
echo.

echo ==================================
echo To add profiles to GitHub:
echo   git add .
echo   git commit -m "Add 77 composer profiles"
echo   git push
pause