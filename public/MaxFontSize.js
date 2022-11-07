const resizeObserver = new ResizeObserver(async (entries) => {
  await document.fonts.ready;
  // Waiting a ticket seems to help, not sure why.
  await new Promise((resolve) => setTimeout(resolve));
  for (const entry of entries) {
    entry.target.resize();
  }
});

class MaxFontSize extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          align-content: center;
          display: grid;
          overflow: hidden;
        }
      </style>
      <div id="container">
        <slot></slot>
      </div>
    `;
    this.container = this.shadowRoot.getElementById("container");
    resizeObserver.observe(this);
  }

  async resize() {
    this.style.visibility = "hidden";

    const clientHeight = this.clientHeight;
    const clientWidth = this.clientWidth;

    const minFontSize = 1;
    const maxFontSize = 10;
    let fontSize = maxFontSize;
    let fits = false;
    while (!fits && fontSize > minFontSize) {
      this.style.fontSize = `${fontSize}vmax`;
      // Seems like we need to wait a tick for the font size to take effect.
      await new Promise((resolve) => setTimeout(resolve));
      const height = this.container.scrollHeight;
      const width = this.container.clientWidth;
      fits = height <= clientHeight && width <= clientWidth;
      if (fits) {
        break;
      }
      fontSize = fontSize - 0.1;
    }

    this.style.visibility = "visible";
  }
}

customElements.define("max-font-size", MaxFontSize);
