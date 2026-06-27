import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('accounts/me/');
                setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const register = async (formData) => {
        const res = await api.post('accounts/register/', formData);
        setUser(res.data);
    };

    const login = async (formData) => {
        const res = await api.post('accounts/login/', formData);
        setUser(res.data);
    };

    const logout = async () => {
        await api.post('accounts/logout/');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);