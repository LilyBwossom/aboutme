import { html, css, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-all.min.js';
import baseStyle from '/css/base.css' with { type: 'css' };

class Container extends LitElement {
  static properties = {
    innerStyle: { type: String, attribute: 'inner-style' }
  };

  static get styles() {
    return [baseStyle, css`
      :host {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, max-content));
        grid-gap: 16px;
        justify-content: center;
        padding: initial;
      }
      `];
  }

  render() {
    return html`
      <style>
      ::slotted(div) {
        background: var(--gradient);
        max-width: 200px;
        min-width: 200px;
        height: 355px;
        float: left;
        margin-right: 25px;
        margin-top: 25px;
        text-align: center;
        border-radius: 6px 6px 6px 6px;
        
        ${this.innerStyle}
      }
      </style>
      
      <slot></slot>
    `;
  }
}

customElements.define('container-div', Container);