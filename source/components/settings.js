import { html, css, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-all.min.js';
import { onClickOutsideDialog, sleep } from '/scripts/utilities.js';
import { setTheme } from '/scripts/themeHandler.js';
import baseStyle from '/css/base.css' with { type: 'css' };

class Settings extends LitElement {
  static get styles() {
    return [baseStyle, css`
      .SettingsButton {
          position: fixed;
          bottom: 15;
          left: 10;
      }

      .SettingsButton:hover {
          -webkit-filter: invert(100%) !important;
      }
      `];
  }

  render() {
    return html`
      <dialog id="SettingsDialog" style="width: 10%;" @click="${(e) => onClickOutsideDialog(e, () => this.changeSettings(false))}">
          <button style="position: absolute; top: 10px; left: 5px;" @click="${() => this.changeSettings(false)}">
             <svg viewBox="0 0 24 24" width="2.4em" height="2.4em">
                <path style="color:var(--text-color)" fill="none" stroke="currentColor" stroke-linecap="round"
                   stroke-linejoin="round" stroke-width="3" d="M18 6L6 18M6 6l12 12"></path>
             </svg>
          </button>
          <br></br>
          <b style="font-size: 24px">Themes:</b>
          <br></br>
          <button type="button" style="width: 6.25rem" class="standard-button"
             @click="${() => setTheme('Midnight')}">Midnight</button><br></br>
          <button type="button" style="width: 6.25rem" class="standard-button"
             @click="${() => setTheme('Blossom')}">Blossom</button><br></br>
       </dialog>

       <button type="submit" class="SettingsButton" @click="${() => this.changeSettings(true)}">
          <img src="/assets/main/settings_button.webp" style="width: 80px; height: 80px;" />
       </button>
    `;
  }

  changeSettings = (open) => {
    const dialog = this.shadowRoot.getElementById("SettingsDialog");
    if (!dialog) {
      return;
    }

    if (open) {
      this.openSettings(dialog);
    } else {
      this.closeSettings(dialog);
    }
  }

  openSettings(dialog) {
    dialog.showModal();
    dialog.style = "opacity: 1;";
    dialog.style.transform = "scale(1,1)";
    document.body.classList.add('blur');
  }

  closeSettings(dialog) {
    dialog.style = "opacity:0;"
    dialog.style.transform = "scale(0.1,0.1)";
    document.body.classList.remove('blur');
    setTimeout(() => { dialog.close(); document.body.classList.remove('blur'); }, 500);
  }
}

customElements.define('settings-button', Settings);