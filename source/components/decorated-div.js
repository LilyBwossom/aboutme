import { html, css, LitElement, styleMap } from 'https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-all.min.js';
import baseStyle from '/css/base.css' with { type: 'css' };

class DecorationPresets {
    // MACROS
    static round(image, hor = true) {
        return {
            'background-image': `url('${image}')`,
            'background-repeat': 'round',
            'background-size': hor ? 'auto 100%' : '100% auto'
        };
    }

    static get pixel() {
        return {
            'image-rendering': 'pixelated'
        }
    }

    // PRESETS
    static get none() {
        return {
            connectionMargins: { top: 0, left: 0, right: 0, bottom: 0 },
            borderMargins: { top: 0, left: 0, right: 0, bottom: 0 },

            // style object
            borderStyles: {
                top: {},
                left: {},
                right: {},
                bottom: {}
            },

            // html
            borderContents: { top: '', left: '', right: '', bottom: '' },
        };
    }

    static get cute() {
        return {
            connectionMargins: { top: 22, left: 7, right: 7, bottom: 9 },
            borderMargins: { top: 27, left: 13, right: 13, bottom: 18 },
            borderStyles: {
                top: {
                    ...this.round('/assets/themes/cute/ribbon_top_middle.png'), ...this.pixel
                },
                left: {
                    ...this.round('/assets/themes/cute/ribbon_left.png', false), ...this.pixel
                },
                right: {
                    ...this.round('/assets/themes/cute/ribbon_right.png', false), ...this.pixel
                },
                bottom: {
                    ...this.round('/assets/themes/cute/ribbon_bottom.png'), ...this.pixel
                }
            },
            borderContents: { top: '', left: '', right: '', bottom: '' },
        };
    }

    static getPreset(name, size) {
        size ??= 1;

        let preset = this[name];
        if (preset) {
            // set the right size and unit
            ['connectionMargins', 'borderMargins'].forEach(key => {
                Object.keys(preset[key]).forEach(side => {
                    preset[key][side] = `${preset[key][side] * size}px`;
                });
            });
            return preset;
        }

        console.warn(`Preset "${name}" not found.`);
        return this.none;
    }
}

class DecoratedDiv extends LitElement {
    static properties = {
        preset: { type: String, reflect: true },
        size: { type: Number, reflect: true },
        amount: { type: Number, reflect: true },

        _decorProps: { type: Object, state: true },
    }

    constructor() {
        super();

        this.size = 1;
        this.style = '';
        this._decorProps = DecorationPresets.getPreset('none');
    }

    connectedCallback() {
        super.connectedCallback();

        this._updateDecorProps();
    }

    attributeChangedCallback(prop, oldVal, newVal) {
        super.attributeChangedCallback(prop, oldVal, newVal);

        if ((prop === 'preset' || prop === 'size') && oldVal !== newVal) {
            this._updateDecorProps();
        }
    }

    _updateDecorProps() {
        if (!this.preset) {
            this._decorProps = DecorationPresets.getPreset('none');
            return;
        }

        this._decorProps = DecorationPresets.getPreset(this.preset, this.size);
        this.requestUpdate();
    }

    static get styles() {
        return [baseStyle, css`
            #main-div {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .border-element {
                position: absolute;
            }

            .top-border {
                top: 0;
            }

            .left-border {
                left: 0;
            }

            .right-border {
                right: 0;
            }

            .bottom-border {
                bottom: 0;
            }

            #content-area {
                position: absolute;
            }
        `];
    }

    _renderBorder(position) {
        const style = {
            ...this._decorProps.borderStyles[position],
            ...this._getBorderStyle(position)
        };

        return html`
            <div 
                class="border-element ${position}-border" style=${styleMap(style)}>
                    ${this._decorProps.borderContents[position]}
            </div>
        `;
    }

    _getBorderStyle(position) {
        const { connectionMargins, borderMargins } = this._decorProps;

        const styles = {
            top: {
                left: connectionMargins.left,
                right: connectionMargins.right,
                height: borderMargins.top
            },
            left: {
                top: connectionMargins.top,
                bottom: connectionMargins.bottom,
                width: borderMargins.left
            },
            right: {
                top: connectionMargins.top,
                bottom: connectionMargins.bottom,
                width: borderMargins.right
            },
            bottom: {
                left: connectionMargins.left,
                right: connectionMargins.right,
                height: borderMargins.bottom
            }
        };

        return styles[position] || {};
    }

    render() {
        return html`
            <div id= "main-div">
            ${this._decorProps ? html`
                ${['top', 'left', 'right', 'bottom'].map(pos => this._renderBorder(pos))}
          
                <div id="content-area" style=${styleMap(this._decorProps.borderMargins)}>
                    <slot></slot>
                </div>
            ` : ''
            }
            </div>
        `;
    }
}

customElements.define('de-div', DecoratedDiv);