# 🚀 CONFIGURACIÓN LISTA PARA VERCEL

## ✅ Backend en Railway
**URL**: https://multimediajuego-production.up.railway.app

---

## 📋 Pasos para Desplegar en Vercel

### 1. Ir a Vercel e Importar
1. Ve a: https://vercel.com
2. Log in con GitHub
3. Click **"Add New..."** → **"Project"**
4. Busca: **`MultimediaJuego`**
5. Click **"Import"**

### 2. Configuración del Proyecto

Copia y pega exactamente:

#### Root Directory
```
juegoFinal/Blender_Threejs_Mongo/game-project
```

#### Framework Preset
```
Vite
```

### 3. Variables de Entorno (Environment Variables)

⚠️ **COPIA Y PEGA ESTAS 2 VARIABLES**:

#### Variable 1:
**Name:**
```
VITE_BACKEND_URL
```
**Value:**
```
https://multimediajuego-production.up.railway.app
```

#### Variable 2:
**Name:**
```
VITE_REQUIRE_AUTH
```
**Value:**
```
true
```

### 4. Deploy
Click en **"Deploy"** y espera 2-5 minutos.

---

## ✅ Después del despliegue

Vercel te dará una URL como:
```
https://multimedia-juego-XXXXX.vercel.app
```

**Cópiala** y actualiza Railway con esa URL para configurar CORS.

---

## 🎮 ¡Eso es todo!

Después del despliegue, tu juego estará funcionando en Vercel conectado a Railway y MongoDB Atlas.
