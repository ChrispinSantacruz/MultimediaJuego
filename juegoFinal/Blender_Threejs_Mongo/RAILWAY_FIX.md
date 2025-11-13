# 🚂 Railway - Solución al Error de Build

## ❌ Error Recibido:
```
⚠ Script start.sh not found
✖ Railpack could not determine how to build the app.
```

## ✅ Solución:

### Opción 1: Configurar Root Directory en Railway (RECOMENDADA)

1. **Entra a tu proyecto en Railway**
2. **Click en tu servicio** (el que acabas de crear)
3. **Ve a Settings** (⚙️ en la parte superior)
4. **Busca "Root Directory"**
5. **Ingresa**: `juegoFinal/Blender_Threejs_Mongo/backend`
6. **Click en "Save"** o presiona Enter
7. Railway detectará automáticamente el `package.json` y construirá correctamente

### Opción 2: Variables de Build (Alternativa)

Si la opción 1 no funciona, también puedes:

1. Ve a **Settings** → **Service**
2. Busca **Custom Start Command**
3. Ingresa: `cd juegoFinal/Blender_Threejs_Mongo/backend && npm start`
4. Busca **Custom Build Command**
5. Ingresa: `cd juegoFinal/Blender_Threejs_Mongo/backend && npm install`

### Opción 3: Usar el archivo nixpacks.toml (Ya incluido)

El archivo `nixpacks.toml` en la raíz del repositorio ya está configurado para que Railway lo detecte automáticamente.

## 🔄 Después de Configurar

1. Railway redesplegará automáticamente
2. Verás en los logs:
   ```
   ✅ Conectado a MongoDB
   ✅ Servidor corriendo en puerto 3001
   ```
3. Ve a **Settings** → **Networking** → **Generate Domain**
4. Copia tu URL de Railway

## 📝 Notas Importantes

- **Root Directory** es la configuración más importante
- Railway necesita encontrar el `package.json` en el directorio que le indiques
- Los archivos `nixpacks.toml` y `railway.toml` son opcionales si configuras el Root Directory

## 🆘 Si sigue sin funcionar

Contacta con los logs completos y te ayudo a diagnosticar el problema específico.
