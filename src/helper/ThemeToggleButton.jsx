import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

const ThemeToggleButton = () => {
    // 1. Initialize state for the current theme
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // 2. Function to update the theme on the HTML element
    const updateThemeOnHtmlEl = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
    };

    // 4. On initial render, set the theme from localStorage
    useEffect(() => {
        updateThemeOnHtmlEl(theme);
    }, [theme]);

    // 5. Toggle theme when button is clicked
    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        // Immediately update localStorage and DOM for instant visual feedback
        localStorage.setItem('theme', newTheme);
        updateThemeOnHtmlEl(newTheme);
        
        // Then update state to trigger re-render if needed
        setTheme(newTheme);
    };

    return (
        <button
            type="button"
            className="modern-nav-button"
            onClick={handleThemeToggle}
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <Icon
                icon={theme === 'dark' ? 'solar:moon-linear' : 'solar:sun-2-linear'}
                className="nav-icon"
            />
        </button>
    );
};

export default ThemeToggleButton;

