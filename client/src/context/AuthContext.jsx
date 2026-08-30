import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser as apiLogin, registerUser as apiRegister } from '../service/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('dropvault_token'));
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const data = await getMe();
                    setUser(data.user);
                } catch (err) {
                    console.error('Session expired or invalid token:', err);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email, password) => {
        const data = await apiLogin({ email, password });
        localStorage.setItem('dropvault_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await apiRegister({ name, email, password });
        localStorage.setItem('dropvault_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('dropvault_token');
        setToken(null);
        setUser(null);
    };

    const openLogin = () => {
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
    };

    const openRegister = () => {
        setAuthModalMode('register');
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            loading,
            login,
            register,
            logout,
            isAuthModalOpen,
            authModalMode,
            setAuthModalMode,
            openLogin,
            openRegister,
            closeAuthModal,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
