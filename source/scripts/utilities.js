export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function onClickOutsideDialog(e, callback) {
    // prevents other buttons from activating this
    if (e.target.tagName !== 'DIALOG')
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