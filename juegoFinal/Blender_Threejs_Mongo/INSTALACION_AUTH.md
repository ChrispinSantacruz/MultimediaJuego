# 📦 Guía de Instalación - Sistema de Autenticación JWT

## 🔧 Instalación de Dependencias

### Backend

```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### Frontend

```bash
cd game-project
npm install zustand
```

## 🚀 Iniciar el Proyecto

### Opción 1: Con Docker (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto iniciará:
- MongoDB en `localhost:27017`
- Backend en `http://localhost:3001`

### Opción 2: Manual

**1. Iniciar MongoDB:**
```bash
# Si tienes MongoDB instalado localmente
mongod
```

**2. Iniciar Backend:**
```bash
cd backend
npm start
```

**3. Iniciar Frontend:**
```bash
cd game-project
npm run dev
```

## ⚙️ Configuración

### Backend (.env)
Crea un archivo `.env` en la carpeta `backend`:

```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/gamedb
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRE=7d
```

### Frontend (.env)
Crea un archivo `.env` en la carpeta `game-project`:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_REQUIRE_AUTH=true
```

**Nota:** Si quieres probar sin autenticación, cambia `VITE_REQUIRE_AUTH=false`

## 🧪 Probar la API

### Registrar Usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### Obtener Perfil (con token)
```bash
curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer [TU_TOKEN_AQUI]"
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'bcryptjs'"
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### Error: "Cannot find module 'zustand'"
```bash
cd game-project
npm install zustand
```

### Error de conexión a MongoDB
- Verifica que MongoDB esté corriendo
- Si usas Docker: `docker-compose logs mongo`
- Si es local: verifica que `mongod` esté activo

### El juego no solicita login
- Verifica que `VITE_REQUIRE_AUTH=true` en `.env` del frontend
- Reinicia el servidor frontend: `npm run dev`

## 📊 Verificar que Todo Funciona

1. **Backend funcionando:**
   ```bash
   curl http://localhost:3001/
   ```
   Debería responder con HTML de la API

2. **MongoDB conectado:**
   Revisa los logs del backend, debe decir "✅ Conectado a MongoDB"

3. **Frontend funcionando:**
   Abre `http://localhost:5173` y debe mostrar la pantalla de login

## 🔐 Flujo de Autenticación

1. Usuario se registra o hace login
2. Backend genera un JWT token
3. Frontend guarda el token en LocalStorage
4. Cada petición al backend incluye el token en headers
5. Backend valida el token y permite el acceso

## 📝 Endpoints Disponibles

### Públicos
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/ranking` - Ranking de jugadores

### Protegidos (requieren token)
- `GET /api/auth/profile` - Perfil del usuario
- `PUT /api/auth/score` - Actualizar puntuación

### Bloques
- `GET /api/blocks?level=1` - Bloques por nivel

## 🎮 Primera Ejecución

1. Inicia el backend y frontend
2. Abre `http://localhost:5173`
3. Regístrate con:
   - Usuario: `test`
   - Email: `test@test.com`
   - Contraseña: `123456`
4. Click en "Registrarse"
5. Automáticamente te llevará al juego
6. ¡Juega!

## 📦 Comandos Útiles

```bash
# Limpiar node_modules y reinstalar
cd backend && rm -rf node_modules && npm install
cd game-project && rm -rf node_modules && npm install

# Ver logs de Docker
docker-compose logs -f

# Reiniciar Docker
docker-compose restart

# Detener Docker
docker-compose down
```
