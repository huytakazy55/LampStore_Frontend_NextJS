"use client";

import { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [themeColors, setThemeColors] = useState({
        StartColorLinear: 'rgba(136,70,249,1)',
        EndColorLinear: 'rgba(255,175,0,1)'
    });

    const [isDark, setIsDark] = useState(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) setIsDark(saved === 'true');
    }, []);

    // Apply dark class to <html>
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('darkMode', isDark);
    }, [isDark]);

    // Lấy màu từ localStorage nếu có
    useEffect(() => {
        const savedColors = localStorage.getItem('themeColors') ? JSON.parse(localStorage.getItem('themeColors')) : null;
        if (savedColors) {
            setThemeColors(savedColors);
        }
    }, []);

    const changeTheme = (colors) => {
        if (typeof colors === 'object') {
            setThemeColors(colors);
            localStorage.setItem('themeColors', JSON.stringify(colors));
        } else {
            console.error('Invalid colors object', colors);
        }
    };

    const toggleDarkMode = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ themeColors, changeTheme, isDark, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
