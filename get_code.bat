@echo off
echo Extracting first 100 lines of script sections...
echo.

echo === RIFFGEN === > code_extract.txt
powershell -Command "(Get-Content gml-riffgen\gml-riffgen.html -Raw) -split '<script>' | Select -Last 1 | Select -First 100" >> code_extract.txt

echo. >> code_extract.txt
echo === TRIADGEN === >> code_extract.txt
powershell -Command "(Get-Content triadgen\FULL_TRIADGEN.html -Raw) -split '<script>' | Select -Last 1 | Select -First 100" >> code_extract.txt

notepad code_extract.txt