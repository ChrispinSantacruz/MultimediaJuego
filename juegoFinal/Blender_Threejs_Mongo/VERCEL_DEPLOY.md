# 🚀 Desplegar Frontend en Vercel

## ✅ Prerequisitos
- Backend desplegado en Railway: ✅
- URL de Railway obtenida (ejemplo: `https://tu-backend.up.railway.app`)

---

## 📝 Pasos para Desplegar en Vercel

### 1. Ir a Vercel
1. Ve a https://vercel.com
2. Click en **"Sign Up"** o **"Log In"**
3. Inicia sesión con **GitHub**

### 2. Importar el Proyecto
1. Click en **"Add New..."** → **"Project"**
2. Busca tu repositorio: **`MultimediaJuego`**
3. Click en **"Import"**

### 3. Configurar el Proyecto

En la página de configuración:

#### **Framework Preset**
- Selecciona: **Vite**

#### **Root Directory**
- Click en **"Edit"**
- Ingresa: `juegoFinal/Blender_Threejs_Mongo/game-project`
- ⚠️ **IMPORTANTE**: Este es el directorio donde está tu frontend

#### **Build and Output Settings** (debería detectarse automáticamente)
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

### 4. Configurar Variables de Entorno

⚠️ **PASO MÁS IMPORTANTE**

En la sección **"Environment Variables"**, agrega:

#### Variable 1: VITE_BACKEND_URL
- **Name**: `VITE_BACKEND_URL`
- **Value**: `https://TU-URL-DE-RAILWAY.up.railway.app`
  
  👆 **Reemplaza con la URL real de tu backend en Railway**
  
  Ejemplo: `https://multimedia-juego-production.up.railway.app`

#### Variable 2: VITE_REQUIRE_AUTH
- **Name**: `VITE_REQUIRE_AUTH`
- **Value**: `true`

### 5. Desplegar
1. Click en **"Deploy"**
2. Vercel comenzará a construir tu proyecto (toma 2-5 minutos)
3. Verás el progreso en tiempo real

### 6. Obtener la URL de Vercel
Una vez desplegado:
1. Vercel te mostrará la URL de tu sitio
2. Ejemplo: `https://multimedia-juego.vercel.app`
3. **Copia esta URL** - la necesitarás para actualizar el backend

---

## ✅ Verificación

Abre tu URL de Vercel en el navegador. Deberías ver:
- La pantalla de login/registro del juego
- Puedes crear una cuenta y hacer login
- El juego debería conectarse al backend en Railway

---

## 🔧 Después del Despliegue

Necesitas actualizar el CORS en Railway para permitir conexiones desde Vercel:

1. Ve a Railway → Variables
2. Agrega/actualiza la variable `FRONTEND_URL`
3. **Value**: `https://tu-proyecto.vercel.app` (la URL que te dio Vercel)
4. Railway redesplegará automáticamente

---

## 🆘 Problemas Comunes

### "Failed to fetch" o errores de CORS
- Verifica que `VITE_BACKEND_URL` tenga la URL correcta de Railway
- Asegúrate de que `FRONTEND_URL` esté configurada en Railway
- La URL NO debe terminar en `/` (barra final)

### Build falla en Vercel
- Verifica que el Root Directory sea correcto
- Asegúrate de que las variables de entorno estén configuradas

### El juego no se conecta al backend
- Abre las DevTools del navegador (F12)
- Ve a la pestaña Console
- Busca errores de red o CORS
- Verifica que la URL del backend sea correcta

---

## 📸 Referencia Visual - Variables en Vercel

```
Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key                    Value
VITE_BACKEND_URL       https://tu-backend.up.railway.app
VITE_REQUIRE_AUTH      true

[Add] button
```

---

## ✨ ¡Listo!

Tu juego estará disponible en:
- **Frontend**: https://tu-proyecto.vercel.app
- **Backend**: https://tu-backend.up.railway.app
- **Base de Datos**: MongoDB Atlas

🎮 ¡Disfruta tu juego en producción!
