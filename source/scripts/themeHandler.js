export function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'Blossom';
    setTheme(savedTheme);
}

initializeTheme();