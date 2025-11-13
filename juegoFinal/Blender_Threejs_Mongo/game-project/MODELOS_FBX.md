# Guía de Modelos FBX en el Proyecto

## 📁 Estructura de Carpetas

Los modelos FBX se encuentran en las siguientes ubicaciones:

```
public/models/
├── PersonajePrincipal/
│   ├── correr.fbx      (Animación de correr)
│   ├── quieto.fbx      (Animación idle/quieto)
│   └── salto.fbx       (Animación de salto)
└── enemigo/
    └── caminar.fbx     (Animación del enemigo caminando)
```

## 🎮 Implementación Actual

### 1. Sistema de Carga (Resources.js)
El sistema ahora soporta tanto GLB como FBX:
- **GLB**: Para modelos de escenario y objetos del mundo
- **FBX**: Para personajes con animaciones

### 2. Personaje Principal (MainCharacter.js)
Clase creada para manejar el personaje principal con 3 animaciones:
- **idle**: Animación de reposo
- **running**: Animación de correr
- **jumping**: Animación de salto

### 3. Enemigo (Enemy.js)
Actualizado para:
- Cargar modelo FBX del enemigo
- Reproducir animación de caminar automáticamente
- Mantener toda la lógica de IA y colisiones

## 🔧 Cómo Usar

### Agregar Nuevos Modelos FBX

1. **Coloca el archivo FBX** en la carpeta correspondiente:
   ```
   public/models/PersonajePrincipal/nueva_animacion.fbx
   ```

2. **Registra el modelo** en `src/Experience/sources.js`:
   ```javascript
   {
       name: 'mainCharacterNewAnimation',
       type: 'fbxModel',
       path: '/models/PersonajePrincipal/nueva_animacion.fbx'
   }
   ```

3. **Usa el modelo** en tu clase:
   ```javascript
   const newAnimation = this.resources.items.mainCharacterNewAnimation
   if (newAnimation.animations && newAnimation.animations.length > 0) {
       this.animation.actions.newAction = this.mixer.clipAction(newAnimation.animations[0])
   }
   ```

### Cambiar Animaciones en Tiempo Real

```javascript
// En MainCharacter.js o cualquier clase con mixer
this.mainCharacter.animation.play('running')  // Cambiar a correr
this.mainCharacter.animation.play('jumping')  // Cambiar a saltar
this.mainCharacter.animation.play('idle')     // Volver a idle
```

## 📝 Notas Importantes

### Escala de Modelos FBX
Los modelos FBX suelen venir en escalas diferentes. Ajusta según necesidad:
```javascript
this.model.scale.set(0.01, 0.01, 0.01)  // Escala actual
```

### Animaciones en FBX
- Cada archivo FBX puede contener múltiples animaciones
- Las animaciones se acceden mediante `model.animations[index]`
- El primer clip (index 0) se usa por defecto

### Diferencias entre GLB y FBX

| Característica | GLB | FBX |
|---------------|-----|-----|
| Tamaño | Más compacto | Más grande |
| Compatibilidad | Nativo Three.js | Requiere FBXLoader |
| Texturas | Embebidas | Pueden ser externas |
| Animaciones | ✅ | ✅ |
| Uso recomendado | Escenarios, objetos | Personajes animados |

## 🐛 Solución de Problemas

### El modelo no se ve
1. Verifica la escala: `console.log(this.model.scale)`
2. Verifica la posición: `console.log(this.model.position)`
3. Verifica que esté en la escena: `console.log(this.scene.children)`

### La animación no se reproduce
1. Verifica que existan animaciones: `console.log(model.animations)`
2. Verifica que el mixer se actualice en `update()`:
   ```javascript
   update() {
       if (this.mixer) {
           this.mixer.update(this.time.delta * 0.001)
       }
   }
   ```

### Errores de carga
1. Verifica la ruta del archivo en `sources.js`
2. Asegúrate de que el archivo existe en `public/models/`
3. Revisa la consola del navegador para errores específicos

## 🎯 Próximos Pasos

1. **Integrar el MainCharacter con el Robot**: Vincular las animaciones FBX al movimiento del robot
2. **Agregar más animaciones**: Atacar, defender, etc.
3. **Optimizar modelos**: Reducir polígonos si es necesario
4. **Agregar transiciones suaves**: Entre diferentes animaciones

## 📚 Recursos Adicionales

- [Three.js FBXLoader Documentation](https://threejs.org/docs/#examples/en/loaders/FBXLoader)
- [Blender to FBX Export Guide](https://docs.blender.org/manual/en/latest/addons/import_export/scene_fbx.html)
- [Animation Mixer Documentation](https://threejs.org/docs/#api/en/animation/AnimationMixer)
