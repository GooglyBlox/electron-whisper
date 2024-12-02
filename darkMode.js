const darkMode = {
    init() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Function to update dark mode
        const updateDarkMode = (isDark) => {
            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.theme = 'light';
            }
        };

        // Initialize dark mode based on:
        // 1. Previous preference in localStorage
        // 2. System preference if no localStorage value
        if (localStorage.theme === 'dark' || (!localStorage.theme && prefersDark.matches)) {
            updateDarkMode(true);
        }
    }
};

module.exports = darkMode;