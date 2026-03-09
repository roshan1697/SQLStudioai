/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => User;
    signup: (name: string, email: string, password: string) => User;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = sessionStorage.getItem('sql_editor_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback((email: string, password: string) => {
        // Simulate login — replace with real API call
        const users = JSON.parse(localStorage.getItem('sql_editor_users') || '[]');
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) throw new Error('Invalid email or password');
        const userData = { id: found.id, name: found.name, email: found.email };
        setUser(userData);
        sessionStorage.setItem('sql_editor_user', JSON.stringify(userData));
        return userData;
    }, []);

    const signup = useCallback((name: string, email: string, password: string) => {
        const users = JSON.parse(localStorage.getItem('sql_editor_users') || '[]');
        if (users.find(u => u.email === email)) throw new Error('Email already in use');
        const newUser = { id: Date.now().toString(), name, email, password };
        users.push(newUser);
        localStorage.setItem('sql_editor_users', JSON.stringify(users));
        const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
        setUser(userData);
        sessionStorage.setItem('sql_editor_user', JSON.stringify(userData));
        return userData;
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem('sql_editor_user');
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
