import { html, css, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-all.min.js';
import baseStyle from '/css/base.css' with { type: 'css' };

class NavBar extends LitElement {
  static get styles() {
    return [baseStyle, css`
    .nav {
      margin-top: 2rem;
      display: flex;
      flex: 1 1 0%;
      justify-content: flex-end;
      gap: 10px;
    }

    .selected {
      text-decoration: underline;
      color: var(--text-highlight);
    }
    `];
  }

  render() {
    return html`
      <nav class="nav">
        <a href="/index.html" class=${this.getSelectedClass('index')}>home</a>
        <a href="/inscryption.html" class=${this.getSelectedClass('inscryption')}>inscryption</a>
        <a href="/blossom-engine.html" class=${this.getSelectedClass('blossom-engine')}>blossom engine</a>
        <a href="/extensions.html" class=${this.getSelectedClass('extensions')}>extensions</a>
      </nav>
    `;
  }

  getSelectedClass(pageName) {
    const pagePath = window.location.pathname;
    const curPageName = pagePath.split("/").pop()?.split(".")[0];
    return (curPageName === pageName.toLowerCase() ? 'selected ' : '') + "navtext";
  }
}

customElements.define('nav-bar', NavBar);