# 📦 Quick Deploy Instructions

## 🚀 Orden de Despliegue

### 1. Backend en Railway (5 minutos)
1. Ve a https://railway.app
2. New Project → Deploy from GitHub repo
3. Selecciona `ChrispinSantacruz/MultimediaJuego`
4. **IMPORTANTE - Configurar Root Directory:**
   - Click en el servicio creado
   - Ve a **Settings** (⚙️)
   - Busca **Root Directory**
   - Escribe: `juegoFinal/Blender_Threejs_Mongo/backend`
   - Click **Save**
5. Add Variables (pestaña Variables):
   ```
   NODE_ENV=production
   PORT=3001
   MONGO_URI=mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/gamedb?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion_12345678
   JWT_EXPIRE=7d
   FRONTEND_URL=https://tu-proyecto.vercel.app
   ```
6. Settings → Generate Domain
7. **Copia la URL generada** (ej: `https://multimedia-juego-production.up.railway.app`)

### 2. Frontend en Vercel (3 minutos)
1. Ve a https://vercel.com
2. Import Project → `ChrispinSantacruz/MultimediaJuego`
3. Root Directory: `juegoFinal/Blender_Threejs_Mongo/game-project`
4. Framework: Vite
5. Add Environment Variables:
   ```
   VITE_BACKEND_URL=https://TU-URL-DE-RAILWAY.up.railway.app
   VITE_REQUIRE_AUTH=true
   ```
6. Deploy

### 3. Actualizar CORS (2 minutos)
1. Copia la URL de Vercel (ej: `https://multimedia-juego.vercel.app`)
2. Ve a Railway → Variables
3. Actualiza `FRONTEND_URL` con la URL de Vercel
4. Railway redesplegará automáticamente

## ✅ Verificación
- Backend: `https://tu-backend.up.railway.app/`
- Frontend: `https://tu-proyecto.vercel.app`

¡Listo! 🎮
