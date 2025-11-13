// Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoose = require('mongoose')
const Block = require('./models/Block')
const fs = require('fs')
const path = require('path')

async function seedDatabase() {
    try {
        // Conectar a MongoDB (usa MONGO_URI de las variables de entorno)
        const mongoUri = process.env.MONGO_URI
        
        if (!mongoUri) {
            console.error('❌ ERROR: MONGO_URI no está configurado')
            console.error('Configura MONGO_URI como variable de entorno')
            process.exit(1)
        }

        console.log('🔄 Conectando a MongoDB...')
        await mongoose.connect(mongoUri)
        console.log('✅ Conectado a MongoDB')

        // Limpiar colección existente
        console.log('🧹 Limpiando colección de bloques...')
        await Block.deleteMany()
        console.log('✅ Colección limpiada')

        // Cargar datos de los 3 niveles
        const level1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'toy_car_blocks.json'), 'utf8'))
        const level2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'toy_car_blocks2.json'), 'utf8'))
        const level3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'toy_car_blocks3.json'), 'utf8'))

        console.log(`📦 Nivel 1: ${level1.length} bloques`)
        console.log(`📦 Nivel 2: ${level2.length} bloques`)
        console.log(`📦 Nivel 3: ${level3.length} bloques`)

        // Insertar todos los datos
        const allBlocks = [...level1, ...level2, ...level3]
        console.log(`🔄 Insertando ${allBlocks.length} bloques en total...`)
        
        await Block.insertMany(allBlocks)

        console.log('✅ Datos insertados correctamente en MongoDB Atlas')
        console.log(`📊 Total de bloques: ${allBlocks.length}`)
        
        // Verificar datos insertados
        const count1 = await Block.countDocuments({ level: 1 })
        const count2 = await Block.countDocuments({ level: 2 })
        const count3 = await Block.countDocuments({ level: 3 })
        
        console.log('\n📈 Resumen:')
        console.log(`  Nivel 1: ${count1} bloques`)
        console.log(`  Nivel 2: ${count2} bloques`)
        console.log(`  Nivel 3: ${count3} bloques`)

        await mongoose.disconnect()
        console.log('\n✅ Proceso completado exitosamente')
        process.exit(0)
    } catch (err) {
        console.error('❌ Error al insertar datos:', err)
        await mongoose.disconnect()
        process.exit(1)
    }
}

seedDatabase()
