require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const blockRoutes = require('./routes/blockRoutes')
const authRoutes = require('./routes/authRoutes')


const app = express()
const port = process.env.PORT || 3001

// Configuración de CORS para producción
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL // URL de Vercel
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true)
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

app.use(express.json())

app.get('/', (req, res) => {
    res.send(`
        <h1>API de bloques</h1>
        <p>Usa la ruta /blocks para interactuar con los bloques.</p>
        <p>Ejemplo de uso en el puerto ${port}:</p>
        `)
});

// Rutas
//app.use('/blocks', blockRoutes)
app.use('/api/blocks', blockRoutes)
app.use('/api/auth', authRoutes)

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Conectado a MongoDB')
    })
    .catch(err => console.error('Error al conectar a MongoDB:', err))

/**
 * Implementacion experiencia multijugador
 */

const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app); // usamos el mismo `app` existente
const io = socketio(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

// Almacén temporal de jugadores
let players = {}

io.on('connection', (socket) => {
    console.log(`🟢 Usuario conectado: ${socket.id}`)

    socket.on('new-player', (data) => {
        console.log(`👤 Jugador inicializado: ${socket.id}`, data)

        players[socket.id] = {
            id: socket.id,
            position: data.position || { x: 0, y: 0, z: 0 },
            rotation: data.rotation || 0,
            color: data.color || '#ffffff'
        }

        // Notificar a los demás jugadores
        socket.broadcast.emit('spawn-player', {
            id: socket.id,
            position: players[socket.id].position,
            rotation: players[socket.id].rotation,
            color: players[socket.id].color
        })

        // Enviar al nuevo jugador la lista de jugadores ya conectados
        socket.emit('players-update', players)

        // Enviar al nuevo jugador los que ya estaban conectados
        const others = Object.entries(players)
            .filter(([id]) => id !== socket.id)
            .map(([id, info]) => ({
                id,
                position: info.position,
                rotation: info.rotation,
                color: info.color
            }))

        socket.emit('existing-players', others)

    })

    socket.on('update-position', ({ position, rotation }) => {
        if (players[socket.id]) {
            players[socket.id].position = position
            players[socket.id].rotation = rotation
            socket.broadcast.emit('update-player', {
                id: socket.id,
                position,
                rotation
            })
        }
    })

    socket.on('disconnect', () => {
        console.log(`🔴 Usuario desconectado: ${socket.id}`)
      
        delete players[socket.id]
      
        // 🧼 Notificar a todos para eliminar al jugador desconectado
        io.emit('remove-player', socket.id)
      
        // 🟡 Opcional: actualizar la lista completa
        io.emit('players-update', players)
      })
      
})


// Escucha en el puerto como siempre
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});

