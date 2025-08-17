export default function pluginSwiper(editor: any) {
  const bm = editor.BlockManager;
  const domc = editor.DomComponents;

  // Block cho Swiper
  bm.add("swiper-block", {
    label: "Swiper Slider",
    category: "Extra",
    media:
      '<svg viewBox="0 0 24 24"><path d="M22 7.6c0-1-.5-1.6-1.3-1.6H3.4C2.5 6 2 6.7 2 7.6v9.8c0 1 .5 1.6 1.3 1.6h17.4c.8 0 1.3-.6 1.3-1.6V7.6zM21 18H3V7h18v11z" fill-rule="nonzero"/><path d="M4 12.5L6 14v-3zM20 12.5L18 14v-3z"/></svg>',
    content: `
      <div class="swiper" style="height: 200px; width: 100%;">
        <div class="swiper-wrapper">
            <div class="swiper-slide"><div>Slide 1</div></div>
            <div class="swiper-slide"><div>Slide 2</div></div>
            <div class="swiper-slide"><div>Slide 3</div></div>
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    `,
  });

  // Khi render trong canvas thì init Swiper
  editor.on("canvas:rendered", () => {
    const iframe = editor.Canvas.getFrameEl();
    const script = iframe.contentDocument.createElement("script");
    script.innerHTML = `
      if (typeof Swiper !== "undefined") {
        new Swiper('.swiper', {
          loop: true,
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
        });
      }
    `;
    iframe.contentDocument.body.appendChild(script);
  });

  // Định nghĩa component swiper trong editor
  domc.addType("swiper", {
    model: {
      defaults: {
        name: "Swiper",
        droppable: ".swiper-wrapper",
      },
    },
  });
}
