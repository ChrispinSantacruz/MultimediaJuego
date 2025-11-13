# 🚀 Guía de Despliegue - Multimedia Juego

## 📋 Resumen de Arquitectura

- **Base de Datos**: MongoDB Atlas
- **Backend**: Railway
- **Frontend**: Vercel

---

## 1️⃣ MongoDB Atlas (Ya configurado)

Tu string de conexión:
```
mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/gamedb?retryWrites=true&w=majority&appName=Cluster0
```

✅ **Pasos en MongoDB Atlas**:
1. Verifica que tu base de datos `gamedb` esté creada
2. Ve a **Network Access** → Permite conexiones desde `0.0.0.0/0` (todas las IPs)
3. Ve a **Database Access** → Verifica que el usuario `christiansantacruzlopez_db_user` tenga permisos de lectura/escritura

---

## 2️⃣ Desplegar Backend en Railway

### Paso 1: Crear cuenta en Railway
1. Ve a https://railway.app
2. Inicia sesión con tu cuenta de GitHub

### Paso 2: Crear nuevo proyecto
1. Click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Conecta tu repositorio: `ChrispinSantacruz/MultimediaJuego`
4. Railway detectará automáticamente tu proyecto Node.js

### Paso 3: Configurar el servicio
1. Una vez creado, ve a **Settings**
2. En **Root Directory**, establece: `juegoFinal/Blender_Threejs_Mongo/backend`
3. En **Start Command**, establece: `npm start`

### Paso 4: Configurar Variables de Entorno
Ve a la pestaña **Variables** y agrega:

```
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/gamedb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion_12345678
JWT_EXPIRE=7d
```

### Paso 5: Generar dominio público
1. Ve a **Settings** → **Networking**
2. Click en **Generate Domain**
3. Copia la URL generada (ejemplo: `https://tu-backend-railway.up.railway.app`)

### Paso 6: Desplegar
1. Railway desplegará automáticamente
2. Verifica los logs para confirmar que se conectó a MongoDB
3. Prueba el endpoint: `https://tu-backend-railway.up.railway.app/`

---

## 3️⃣ Desplegar Frontend en Vercel

### Paso 1: Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Inicia sesión con tu cuenta de GitHub

### Paso 2: Importar proyecto
1. Click en **"Add New"** → **"Project"**
2. Importa tu repositorio: `ChrispinSantacruz/MultimediaJuego`

### Paso 3: Configurar el proyecto
1. En **Root Directory**, establece: `juegoFinal/Blender_Threejs_Mongo/game-project`
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Paso 4: Configurar Variables de Entorno
En la sección **Environment Variables**, agrega:

```
VITE_BACKEND_URL=https://tu-backend-railway.up.railway.app
VITE_REQUIRE_AUTH=true
```

⚠️ **IMPORTANTE**: Reemplaza `https://tu-backend-railway.up.railway.app` con la URL real de tu backend en Railway

### Paso 5: Desplegar
1. Click en **"Deploy"**
2. Vercel construirá y desplegará automáticamente
3. Obtendrás una URL como: `https://tu-proyecto.vercel.app`

---

## 4️⃣ Configurar CORS en el Backend

Después del despliegue, actualiza el archivo `app.js` en tu backend para permitir CORS desde tu dominio de Vercel:

```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://tu-proyecto.vercel.app'  // Agrega tu URL de Vercel
    ],
    credentials: true
}));
```

Haz commit y push de este cambio para que Railway lo redespiegue automáticamente.

---

## 5️⃣ Poblar la Base de Datos (Opcional)

Si necesitas poblar tu base de datos con datos iniciales:

1. Desde tu terminal local, configura la variable de entorno:
```bash
export MONGO_URI="mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/gamedb?retryWrites=true&w=majority&appName=Cluster0"
```

2. Ejecuta el script de seed:
```bash
cd juegoFinal/Blender_Threejs_Mongo/backend
node seed.js
```

---

## 6️⃣ Verificar el Despliegue

### Backend (Railway)
```bash
curl https://tu-backend-railway.up.railway.app/
```

### Frontend (Vercel)
Abre tu navegador en: `https://tu-proyecto.vercel.app`

---

## 🔧 Solución de Problemas

### Error de conexión a MongoDB
- Verifica que la IP `0.0.0.0/0` esté permitida en MongoDB Atlas
- Confirma que la contraseña no tenga caracteres especiales (o que estén codificados en URL)

### Error de CORS
- Asegúrate de que la URL de Vercel esté en la lista de orígenes permitidos en `app.js`
- Verifica que `credentials: true` esté configurado si usas autenticación

### Frontend no conecta al backend
- Verifica que `VITE_BACKEND_URL` en Vercel apunte a la URL correcta de Railway
- Confirma que el backend esté ejecutándose en Railway
- Revisa los logs en Railway para errores

### Archivos grandes en Git
- Los archivos `.fbx` ya están configurados con Git LFS
- Si hay problemas, ejecuta: `git lfs migrate import --include="*.fbx" --everything`

---

## 📝 Comandos Útiles

### Ver logs de Railway
```bash
railway logs
```

### Ver logs de Vercel
Desde el dashboard de Vercel → Tu proyecto → Logs

### Redesplegar
- **Railway**: Haz push a tu repo de GitHub, Railway redesplegará automáticamente
- **Vercel**: Haz push a tu repo de GitHub, Vercel redesplegará automáticamente

---

## 🎮 ¡Listo!

Tu juego debería estar completamente desplegado y funcionando en:
- **Backend**: Railway
- **Frontend**: Vercel
- **Base de Datos**: MongoDB Atlas

¡Disfruta tu juego en producción! 🚀
