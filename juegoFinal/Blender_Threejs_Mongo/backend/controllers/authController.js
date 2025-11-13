const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambiar_en_produccion';
const JWT_EXPIRE = '7d';

// Generar JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Registro de usuario
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validar campos
        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: 'Todos los campos son requeridos' 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                error: existingUser.email === email 
                    ? 'El email ya está registrado' 
                    : 'El nombre de usuario ya existe' 
            });
        }

        // Crear nuevo usuario
        const user = new User({ username, email, password });
        await user.save();

        // Generar token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                totalScore: user.totalScore,
                levelsCompleted: user.levelsCompleted
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

// Login de usuario
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Verificar contraseña
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Generar token
        const token = generateToken(user._id);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                totalScore: user.totalScore,
                levelsCompleted: user.levelsCompleted
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                totalScore: req.user.totalScore,
                levelsCompleted: req.user.levelsCompleted,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

// Actualizar puntuación del usuario
exports.updateScore = async (req, res) => {
    try {
        const { score, level } = req.body;

        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({ error: 'Puntuación inválida' });
        }

        const user = await User.findById(req.user._id);
        user.totalScore += score;
        
        if (level && level > user.levelsCompleted) {
            user.levelsCompleted = level;
        }

        await user.save();

        res.json({
            message: 'Puntuación actualizada',
            user: {
                id: user._id,
                username: user.username,
                totalScore: user.totalScore,
                levelsCompleted: user.levelsCompleted
            }
        });
    } catch (error) {
        console.error('Error al actualizar puntuación:', error);
        res.status(500).json({ error: 'Error al actualizar puntuación' });
    }
};

// Obtener ranking de usuarios
exports.getRanking = async (req, res) => {
    try {
        const users = await User.find()
            .select('username totalScore levelsCompleted')
            .sort({ totalScore: -1 })
            .limit(10);

        res.json({ ranking: users });
    } catch (error) {
        console.error('Error al obtener ranking:', error);
        res.status(500).json({ error: 'Error al obtener ranking' });
    }
};
