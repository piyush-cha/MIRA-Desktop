@echo off
echo Starting Vite Dev Server...
start cmd /k "npm run dev"
echo Waiting 5 seconds for Vite to start...
timeout /t 5 /nobreak > nul

echo Launching 6 isolated MIRA Electron instances...
start cmd /k "npx electron . --user-data-dir=%TEMP%\mira_role_1"
start cmd /k "npx electron . --user-data-dir=%TEMP%\mira_role_2"
start cmd /k "npx electron . --user-data-dir=%TEMP%\mira_role_3"
start cmd /k "npx electron . --user-data-dir=%TEMP%\mira_role_4"
start cmd /k "npx electron . --user-data-dir=%TEMP%\mira_role_5"
echo All instances launched successfully!
