// Script para verificar y arreglar coordenadas duplicadas en nivel 2
const fs = require('fs');
const path = require('path');

const level2Path = path.join(__dirname, 'data', 'toy_car_blocks2.json');
const level2Data = JSON.parse(fs.readFileSync(level2Path, 'utf8'));

console.log(`📦 Nivel 2: ${level2Data.length} bloques`);

// Contar duplicados
const coordsMap = new Map();
level2Data.forEach((block, index) => {
    const key = `${block.x.toFixed(2)},${block.y.toFixed(2)},${block.z.toFixed(2)}`;
    if (!coordsMap.has(key)) {
        coordsMap.set(key, []);
    }
    coordsMap.get(key).push(index);
});

let duplicates = 0;
coordsMap.forEach((indices, coords) => {
    if (indices.length > 1) {
        duplicates += indices.length - 1;
        console.log(`⚠️  ${indices.length} bloques en ${coords}`);
    }
});

console.log(`\n📊 Resumen:`);
console.log(`  Total bloques: ${level2Data.length}`);
console.log(`  Posiciones únicas: ${coordsMap.size}`);
console.log(`  Bloques duplicados: ${duplicates}`);

if (duplicates > 0) {
    console.log(`\n⚠️  Hay ${duplicates} bloques con coordenadas duplicadas`);
    console.log(`Esto puede causar problemas de colisión en el juego`);
} else {
    console.log(`\n✅ No hay coordenadas duplicadas`);
}
