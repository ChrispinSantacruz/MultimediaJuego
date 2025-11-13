# 🔧 Configurar Variables de Entorno en Railway

## ❌ Error Actual:
```
Error: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

**Causa**: Las variables de entorno NO están configuradas en Railway.

---

## ✅ Solución - Configurar Variables en Railway:

### Paso 1: Acceder a Variables
1. Ve a tu proyecto en Railway: https://railway.app
2. Click en tu servicio (backend)
3. Click en la pestaña **"Variables"** (🔑 icono de llave)

### Paso 2: Agregar Variables (una por una)

Click en **"+ New Variable"** y agrega cada una:

#### Variable 1: NODE_ENV
```
NODE_ENV=production
```

#### Variable 2: PORT
```
PORT=8080
```
⚠️ **NOTA**: Railway usa puerto 8080 por defecto, no 3001

#### Variable 3: MONGO_URI (LA MÁS IMPORTANTE)
```
MONGO_URI=mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/gamedb?retryWrites=true&w=majority&appName=Cluster0
```

⚠️ **IMPORTANTE**: 
- Copia EXACTAMENTE esta URL
- NO agregues espacios
- Verifica que el punto después de "Pipeman06" esté incluido

#### Variable 4: JWT_SECRET
```
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion_12345678
```

#### Variable 5: JWT_EXPIRE
```
JWT_EXPIRE=7d
```

#### Variable 6: FRONTEND_URL (opcional por ahora)
```
FRONTEND_URL=https://tu-proyecto.vercel.app
```
*(La actualizarás después de desplegar en Vercel)*

### Paso 3: Guardar y Redesplegar
1. Railway guardará automáticamente cada variable
2. Después de agregar todas, click en **"Deploy"** o espera el redespliegue automático
3. Ve a la pestaña **"Deployments"** para ver los logs

---

## 📋 Verificación de Variables

Para verificar que las variables están bien configuradas:

1. En Railway, ve a **Variables**
2. Deberías ver las 6 variables listadas
3. Click en el ícono de "ojo" 👁️ para ver los valores (sensibles están ocultos)

---

## 🔍 Verificar Logs

Después de redesplegar, los logs deberían mostrar:

```
✅ Servidor corriendo en puerto 8080
🔄 Conectando a MongoDB...
✅ Conectado a MongoDB
```

Si ves:
```
❌ ERROR: MONGO_URI no está configurado
```
Significa que necesitas agregar las variables.

---

## 🆘 Problemas Comunes

### "MongooseError: uri must be a string"
- **Causa**: MONGO_URI no está configurada
- **Solución**: Agrega la variable MONGO_URI en Railway

### "MongoServerError: bad auth"
- **Causa**: Usuario/contraseña incorrectos
- **Solución**: Verifica las credenciales en MongoDB Atlas

### "MongooseError: connect ETIMEDOUT"
- **Causa**: MongoDB Atlas bloqueando la conexión
- **Solución**: En MongoDB Atlas → Network Access → Agregar IP `0.0.0.0/0`

---

## 📸 Referencia Visual

Las variables en Railway se ven así:

```
NODE_ENV        production
PORT            8080
MONGO_URI       mongodb+srv://christian...
JWT_SECRET      tu_secreto_super_seguro...
JWT_EXPIRE      7d
FRONTEND_URL    https://tu-proyecto.vercel.app
```

---

## ✅ Checklist Final

- [ ] Todas las 6 variables agregadas en Railway
- [ ] MONGO_URI copiado exactamente (con el punto después de la contraseña)
- [ ] MongoDB Atlas permite conexiones desde 0.0.0.0/0
- [ ] Usuario de MongoDB tiene permisos de lectura/escritura
- [ ] Railway redesplegar después de agregar variables
- [ ] Logs muestran "✅ Conectado a MongoDB"
