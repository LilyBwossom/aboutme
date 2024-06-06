setTheme(localStorage.getItem('theme'));

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var SettingsOpen = false;

function toggleSettings() {
    console.log("pressed!");
    SettingsOpen = !SettingsOpen;
    if (SettingsOpen) {
        document.getElementById("SettingsDialog").showModal();
        document.getElementById("SettingsDialog").style = "opacity: 1;";
        document.getElementById("SettingsDialog").style.transform = "scale(1,1)";
        document.body.classList.add('blur');
    } else {
        document.getElementById("SettingsDialog").style = "opacity:0;"
        document.getElementById("SettingsDialog").style.transform = "scale(0.1,0.1)";
        document.body.classList.remove('blur');
        document.getElementById("SettingsDialog").close();
    }
}

function setTheme(theme) {
    console.log("theme!");
    localStorage.setItem('theme', theme);
    if (theme == 'Midnight') {
        document.documentElement.style.setProperty('--bg-color', '#000');
        document.documentElement.style.setProperty('--menu-bg-color', '#111111');
        document.documentElement.style.setProperty('--text-color', '#fff');
        document.documentElement.style.setProperty('--text-highlight', '#FFA8D9');
    }
    if (theme == 'Blossom') {
        document.documentElement.style.setProperty('--bg-color', '#fff');
        document.documentElement.style.setProperty('--menu-bg-color', '#EEEEEE');
        document.documentElement.style.setProperty('--text-color', '#000');
        document.documentElement.style.setProperty('--text-highlight', '#FF66BF');
    }
}