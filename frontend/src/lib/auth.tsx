"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (access: string, refresh: string, isAdmin?: boolean) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
    isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const adminKey = localStorage.getItem('admin_key');
        if (token) {
            setIsAuthenticated(true);
        }
        if (adminKey) {
            setIsAdmin(true);
        }
    }, []);

    const login = (access: string, refresh: string, isAdminLogin: boolean = false) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setIsAuthenticated(true);
        if (isAdminLogin) {
            // Just mocking admin key for assignment
            localStorage.setItem('admin_key', 'default_admin_secret');
            setIsAdmin(true);
        }
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('admin_key');
        setIsAuthenticated(false);
        setIsAdmin(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
