setTheme(localStorage.getItem('theme'));

function dialogClickHandler(e, callback) {
    if (e.target.tagName !== 'DIALOG') //This prevents issues with forms
        return;

    const rect = e.target.getBoundingClientRect();

    const clickedInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
    );

    if (clickedInDialog === false)
        callback();
}

document.addEventListener("DOMContentLoaded", function(arg) {
		document.getElementById("SettingsDialog").addEventListener('click', function(event) {
        dialogClickHandler(event, toggleSettings);
    });
});

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
		document.documentElement.style.setProperty('--gradient', 'linear-gradient(to bottom right, rgba(119,81,109,1) 25%, rgba(200,134,184,1) 100%)');
    }
    if (theme == 'Blossom') {
        document.documentElement.style.setProperty('--bg-color', '#fff');
        document.documentElement.style.setProperty('--menu-bg-color', '#EEEEEE');
        document.documentElement.style.setProperty('--text-color', '#000');
        document.documentElement.style.setProperty('--text-highlight', '#FF66BF');
		document.documentElement.style.setProperty('--gradient', 'linear-gradient(90deg, rgba(214,149,198,1) 25%, rgba(255,173,237,1) 100%)');
    }
}