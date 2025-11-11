@echo off
REM Build script for Kokoro TTS Firefox addon (Windows)

REM Get version from manifest.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" manifest.json') do (
    set VERSION=%%~a
)

REM XPI filename
set XPI_NAME=kokoro-tts-addon-v%VERSION%.xpi

REM Remove old XPI if exists
if exist *.xpi del *.xpi

REM Create XPI using PowerShell
echo Building %XPI_NAME%...
powershell -Command "Compress-Archive -Path manifest.json,background.js,content.js,popup.html,popup.js,player.html,player.js,styles.css,icons -DestinationPath %XPI_NAME%.zip -Force"
ren %XPI_NAME%.zip %XPI_NAME%

echo.
echo Successfully created %XPI_NAME%

REM Generate checksum
echo Generating SHA256 checksum...
powershell -Command "Get-FileHash -Algorithm SHA256 '%XPI_NAME%' | Select-Object -ExpandProperty Hash | Out-File -Encoding ASCII -NoNewline '%XPI_NAME%.sha256.tmp'"
powershell -Command "((Get-Content '%XPI_NAME%.sha256.tmp') + '  %XPI_NAME%') | Set-Content '%XPI_NAME%.sha256'"
del %XPI_NAME%.sha256.tmp
echo Checksum saved to %XPI_NAME%.sha256

echo.
echo To install in Firefox:
echo 1. Go to about:addons
echo 2. Click the gear icon -^> 'Install Add-on From File...'
echo 3. Select %XPI_NAME%
pause
