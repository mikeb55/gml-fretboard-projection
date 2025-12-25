@echo off
REM ========================================
REM Quintet Composer v7.0 Code Analyzer
REM Extracts rhythm and MusicXML patterns
REM ========================================

set SOURCE_DIR=C:\Users\mike\Documents\gml-workspace\quintet-composer
set OUTPUT_FILE=quintet-rhythm-analysis.txt

echo Analyzing Quintet Composer v7.0 files... > %OUTPUT_FILE%
echo ======================================== >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Change to the quintet-composer directory
cd /d %SOURCE_DIR%

REM List all relevant files
echo === FILE STRUCTURE === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
dir /b *.js *.html *.json 2>nul >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Search for rhythm-related code
echo === RHYTHM PATTERNS === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
findstr /i /n "rhythm tuplet time-modification 3:2 5:4 7:4 11:8 13:8" *.js *.html 2>nul >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Search for MusicXML generation
echo === MUSICXML GENERATION === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
findstr /i /n "score-partwise generateMusicXML generateXML divisions duration" *.js *.html 2>nul >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Search for note and rest handling
echo === NOTE/REST GENERATION === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
findstr /i /n "note rest forward beam actual-notes normal-notes" *.js *.html 2>nul >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Search for polyrhythmic features
echo === POLYRHYTHMIC FEATURES === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
findstr /i /n "polyrhythm complex.rhythm generatePattern" *.js *.html 2>nul >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Extract function definitions
echo === FUNCTION DEFINITIONS === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
findstr /i /n "function.*rhythm function.*generate function.*pattern function.*music" *.js *.html 2>nul >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

REM Look for specific working examples
echo === WORKING EXAMPLES === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
findstr /i /n "bulletproof final working tested" *.js *.html *.txt *.md 2>nul >> %OUTPUT_FILE%

REM Check for any README or documentation
echo === DOCUMENTATION === >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%
if exist README.md (
    echo README.md contents: >> %OUTPUT_FILE%
    type README.md >> %OUTPUT_FILE%
    echo. >> %OUTPUT_FILE%
)

REM Display summary
echo.
echo Analysis complete! Results saved to: %OUTPUT_FILE%
echo.
echo File location: %SOURCE_DIR%\%OUTPUT_FILE%
echo.
echo Opening results file...
notepad %OUTPUT_FILE%

pause