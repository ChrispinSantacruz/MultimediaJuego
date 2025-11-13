import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            // Registro
            register: async (username, email, password) => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_URL}/api/auth/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, email, password })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Error al registrar');
                    }

                    console.log('✅ REGISTRO EXITOSO');
                    console.log('👤 Usuario:', data.user);
                    console.log('🔑 JWT Token:', data.token);
                    console.log('📊 Decodificado:', JSON.parse(atob(data.token.split('.')[1])));

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false
                    });

                    return { success: true };
                } catch (error) {
                    set({ loading: false, error: error.message });
                    return { success: false, error: error.message };
                }
            },

            // Login
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const response = await fetch(`${API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Error al iniciar sesión');
                    }

                    console.log('✅ LOGIN EXITOSO');
                    console.log('👤 Usuario:', data.user);
                    console.log('🔑 JWT Token:', data.token);
                    console.log('📊 Decodificado:', JSON.parse(atob(data.token.split('.')[1])));

                    set({
                        user: data.user,
                        token: data.token,
                        isAuthenticated: true,
                        loading: false
                    });

                    return { success: true };
                } catch (error) {
                    set({ loading: false, error: error.message });
                    return { success: false, error: error.message };
                }
            },

            // Logout
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            // Actualizar puntuación
            updateScore: async (score, level) => {
                const { token } = get();
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/api/auth/score`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ score, level })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        set({ user: data.user });
                    }
                } catch (error) {
                    console.error('Error al actualizar puntuación:', error);
                }
            },

            // Obtener perfil
            getProfile: async () => {
                const { token } = get();
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/api/auth/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const data = await response.json();

                    if (response.ok) {
                        set({ user: data.user });
                    }
                } catch (error) {
                    console.error('Error al obtener perfil:', error);
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export default useAuthStore;
