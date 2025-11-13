// Script para arreglar los datos del nivel 3 agregando role: "default"
const fs = require('fs');
const path = require('path');

// Leer el archivo del nivel 3
const level3Path = path.join(__dirname, 'data', 'toy_car_blocks3.json');
const level3Data = JSON.parse(fs.readFileSync(level3Path, 'utf8'));

console.log(`📦 Nivel 3: ${level3Data.length} bloques encontrados`);

// Agregar role: "default" a todos los bloques que no lo tengan
let fixed = 0;
level3Data.forEach(block => {
    if (!block.role) {
        block.role = "default";
        fixed++;
    }
});

console.log(`✅ ${fixed} bloques actualizados con role: "default"`);

// Guardar el archivo actualizado
fs.writeFileSync(level3Path, JSON.stringify(level3Data, null, 4));
console.log(`💾 Archivo guardado: ${level3Path}`);
console.log('✅ Proceso completado');
