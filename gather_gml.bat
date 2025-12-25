@echo off
echo Gathering GML Files for Import > gml_files.txt
echo ================================== >> gml_files.txt
echo. >> gml_files.txt

echo Searching for RiffGen files...
echo === RIFFGEN === >> gml_files.txt
dir gml-riffgen\*.html /B 2>nul >> gml_files.txt
echo. >> gml_files.txt
type gml-riffgen\*.html 2>nul | findstr /i "function generate melody rhythm scale" >> gml_files.txt
echo. >> gml_files.txt

echo Searching for TriadGen files...
echo === TRIADGEN === >> gml_files.txt
dir triadgen\*.html /B 2>nul >> gml_files.txt
echo. >> gml_files.txt
type triadgen\*.html 2>nul | findstr /i "function chord triad harmony progression" >> gml_files.txt
echo. >> gml_files.txt

echo Done! Check gml_files.txt
notepad gml_files.txt