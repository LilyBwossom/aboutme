document.addEventListener('DOMContentLoaded', function () {
    const cursorThemeList = ['Pear']
    if (!cursorThemeList.includes(localStorage.getItem('theme'))) {
        return;
    }

    const cursorImage = document.createElement('img');
    cursorImage.id = 'cursor';
    cursorImage.width = 48;
    cursorImage.height = 48;
    document.body.appendChild(cursorImage);

    // hide the cursor
    document.body.style.cursor = 'none';

    document.addEventListener("mousemove", function (e) {
        const cursorOffsetX = parseInt(window.getComputedStyle(document.body).getPropertyValue('--cursor-offsetX'), 10) || 0;
        const cursorOffsetY = parseInt(window.getComputedStyle(document.body).getPropertyValue('--cursor-offsetY'), 10) || 0;

        cursorImage.style.left = (e.pageX - cursorOffsetX) + 'px';
        cursorImage.style.top = (e.pageY - cursorOffsetY) + 'px';
    }, false);
});