/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000'

interface User {
    id: string;
    
    email: string;
}

interface AuthContextType {
    userdata: User | null;
    login: (email: string, password: string) => Promise<User | undefined> ;
    signup: (name: string, email: string, password: string) => Promise<User | undefined>;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);

const setToken = (token:string) =>{
    const expireTime = new Date()
    expireTime.setTime(expireTime.getTime() + (24 * 60 * 60 * 1000))  //24h expiry
    document.cookie = `authToken=${token}; expires=${expireTime.toUTCString()}; path=/; SameSite=Strict; Secure`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userdata, setUserData] = useState<User | null>(() => {
        try {
            const stored = sessionStorage.getItem('user_data');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback(async(email: string, password: string) => {
        try {
            const user = await axios.post(`${BASE_URL}/login`,{
            email:email,
            password:password
        })
        if(user){
            setToken(user.data.token)
        const  userData = {id:user.data.id,email:user.data.email}
        setUserData(userData);
        sessionStorage.setItem('user_data' , JSON.stringify(userData))
        return userData
        }
        
        } catch (error) {
            console.log(error)
        }
        
        
    }, []);

    const signup = useCallback(async(name: string, email: string, password: string) => {
        try {
            const user = await axios.post(`${BASE_URL}/signup`,{
                name:name,
                email:email,
                password:password
            })
            if(user){
                setToken(user.data.token)
                const userData = {id:user.data.id,email:user.data.email}
                setUserData(userData)
                sessionStorage.setItem('user_data', JSON.stringify(userData))
                return userData
            }
        } catch (error) {
            console.log(error)
        }
    }, []);

    const logout = useCallback(() => {
        setUserData(null);
        sessionStorage.removeItem('user_data');
    }, []);

    return (
        <AuthContext.Provider value={{ userdata, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
