#!/bin/bash

echo "🚀 Instalando dependencias del Sistema de Autenticación JWT..."

# Backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
npm install bcryptjs jsonwebtoken

# Frontend
echo "📦 Instalando dependencias del frontend..."
cd ../game-project
npm install
npm install zustand

echo "✅ Instalación completa!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configura los archivos .env en backend/ y game-project/"
echo "2. Inicia MongoDB: mongod"
echo "3. Inicia el backend: cd backend && npm start"
echo "4. Inicia el frontend: cd game-project && npm run dev"
echo ""
echo "O usa Docker: docker-compose up --build"
