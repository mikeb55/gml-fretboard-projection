@echo off
echo Extracting GML Functions > extracted_code.txt
echo ======================== >> extracted_code.txt
echo. >> extracted_code.txt

echo RIFFGEN CODE: >> extracted_code.txt
echo ------------- >> extracted_code.txt
type gml-riffgen\gml-riffgen.html | find /N "generateRiff" >> extracted_code.txt
type gml-riffgen\gml-riffgen.html | find /N "generateMelody" >> extracted_code.txt
type gml-riffgen\gml-riffgen.html | find /N "scales" >> extracted_code.txt
echo. >> extracted_code.txt

echo TRIADGEN CODE: >> extracted_code.txt
echo -------------- >> extracted_code.txt
type triadgen\FULL_TRIADGEN.html | find /N "generateChord" >> extracted_code.txt
type triadgen\FULL_TRIADGEN.html | find /N "generateTriad" >> extracted_code.txt
type triadgen\FULL_TRIADGEN.html | find /N "progression" >> extracted_code.txt

echo Done! Opening extracted_code.txt
notepad extracted_code.txt