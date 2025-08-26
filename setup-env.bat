@echo off
echo Creating .env file from env.example...
copy env.example .env
echo.
echo .env file created successfully!
echo.
echo Please update the following variables in your .env file:
echo 1. NEXTAUTH_SECRET - Generate a random string
echo 2. GOOGLE_CLIENT_ID - Your Google OAuth client ID
echo 3. GOOGLE_CLIENT_SECRET - Your Google OAuth client secret
echo.
echo You can generate a NEXTAUTH_SECRET by running: openssl rand -base64 32
echo.
pause
