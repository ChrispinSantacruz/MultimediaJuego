import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import '../styles/auth.css';

export default function AuthScreen({ onStartGame }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData.username, formData.email, formData.password);
        }

        setLoading(false);

        if (result.success) {
            onStartGame();
        } else {
            setError(result.error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🎮 Bienvenido al Juego</h1>
                    <p>{isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta para jugar'}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required={!isLogin}
                                placeholder="Tu nombre de usuario"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Cargando...' : isLogin ? '🔓 Iniciar Sesión' : '🎯 Registrarse'}
                    </button>

                    <button 
                        type="button" 
                        className="guest-button" 
                        onClick={() => onStartGame()}
                        disabled={loading}
                    >
                        👤 Continuar como Invitado
                    </button>
                </form>

                <div className="auth-switch">
                    <p>
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="switch-button"
                        >
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>

                <div className="auth-footer">
                    <p>🎓 Proyecto Final - Multimedia + Ingeniería Web</p>
                </div>
            </div>
        </div>
    );
}
