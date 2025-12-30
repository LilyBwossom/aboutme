import { html, css, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-all.min.js';
import baseStyle from '/css/base.css' with { type: 'css' };

class Kofi extends LitElement {
  static get styles() {
    return [baseStyle, css`
      .kofiimage {
        width: 37px;
        height: 37px;
        top: 2px;
        left: 1px;
        position: relative;
      }

      .donatebutton {
        position: fixed;
        bottom: 15;
        width: 175px;
        height: 47.5px;
        border-radius: 25px;
        left: 50%;
        background-color:var(--text-highlight);
        transform: translate(-50%, 0);
      }

      b {
        font-size: 16px;
        position: relative;
        margin-left: 5px;
        bottom: 11px;
        color: #fff;
      }
    `];
  }

  render() {
    return html`
     <button class="donatebutton" onclick="window.open('https:\/\/ko-fi.com/lilysylvie','_blank')">
        <img class="kofiimage" src="/assets/main/kofi.svg">
        <b>Support me</b>
      </button>
    `;
  }
}

customElements.define('donate-button', Kofi);