@echo off
echo 🚀 Instalando dependencias del Sistema de Autenticacion JWT...

REM Backend
echo 📦 Instalando dependencias del backend...
cd backend
call npm install
call npm install bcryptjs jsonwebtoken

REM Frontend
echo 📦 Instalando dependencias del frontend...
cd ..\game-project
call npm install
call npm install zustand

cd ..
echo ✅ Instalacion completa!
echo.
echo 📝 Proximos pasos:
echo 1. Configura los archivos .env en backend/ y game-project/
echo 2. Inicia MongoDB: mongod
echo 3. Inicia el backend: cd backend ^&^& npm start
echo 4. Inicia el frontend: cd game-project ^&^& npm run dev
echo.
echo O usa Docker: docker-compose up --build
pause
