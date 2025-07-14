@echo off
echo ================================
echo Portfolio Agent Deployment Script
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Docker is running ✓
echo.

REM Prompt for Docker Hub username
set /p DOCKER_USERNAME=Enter your Docker Hub username: 
if "%DOCKER_USERNAME%"=="" (
    echo ERROR: Docker Hub username is required
    pause
    exit /b 1
)

echo Using Docker Hub username: %DOCKER_USERNAME%
echo.

REM Build the project
echo Building Mastra project...
pnpm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo Build completed ✓
echo.

REM Build Docker container
echo Building Docker container...
docker build -t %DOCKER_USERNAME%/nosana-portfolio-agent:latest .
if %errorlevel% neq 0 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)
echo Docker container built ✓
echo.

REM Update Nosana job definition
echo Updating Nosana job definition...
powershell -Command "(Get-Content nos_job_def/nosana_mastra.json) -replace 'yourusername', '%DOCKER_USERNAME%' | Set-Content nos_job_def/nosana_mastra.json"
echo Job definition updated ✓
echo.

REM Push to Docker Hub
echo Logging into Docker Hub...
docker login
if %errorlevel% neq 0 (
    echo ERROR: Docker login failed
    pause
    exit /b 1
)

echo Pushing container to Docker Hub...
docker push %DOCKER_USERNAME%/nosana-portfolio-agent:latest
if %errorlevel% neq 0 (
    echo ERROR: Docker push failed
    pause
    exit /b 1
)
echo Container pushed to Docker Hub ✓
echo.

echo ================================
echo Deployment Ready!
echo ================================
echo.
echo Your container is now available at:
echo docker.io/%DOCKER_USERNAME%/nosana-portfolio-agent:latest
echo.
echo Next steps:
echo 1. Go to https://dashboard.nosana.com/deploy
echo 2. Connect your Phantom wallet
echo 3. Get NOS and SOL tokens from Discord
echo 4. Upload the updated nos_job_def/nosana_mastra.json
echo 5. Select a GPU market and deploy!
echo.
echo Or use Nosana CLI:
echo nosana job post --file nos_job_def/nosana_mastra.json --market nvidia-3060 --timeout 30
echo.
pause 