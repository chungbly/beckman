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
      <div class="swiper" style="height: 200px; width: 100%;" data-autoplay="true" data-delay="3000">
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

  // 🟢 Inject Swiper assets ONCE
  editor.on("load", () => {
    const iframe = editor.Canvas.getFrameEl();
    if (!iframe) return;
    const frameDoc = iframe.contentDocument;
    if (!frameDoc) return;

    const frameHead = frameDoc.head;

    // inject CSS nếu chưa có
    if (!frameHead.querySelector("#swiper-css")) {
      const link = document.createElement("link");
      link.id = "swiper-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
      frameHead.appendChild(link);
    }

    // inject JS nếu chưa có
    if (!frameHead.querySelector("#swiper-js")) {
      const script = document.createElement("script");
      script.id = "swiper-js";
      script.src =
        "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
      script.onload = () => initSwipers();
      frameHead.appendChild(script);
    } else {
      initSwipers();
    }
  });

  // 🟢 Hàm init Swiper trong canvas
  function initSwipers() {
    const frameWin = editor.Canvas.getFrame().contentWindow;
    if (!frameWin || !frameWin.Swiper) return;

    const body = editor.Canvas.getFrame().body;
    body.querySelectorAll(".swiper").forEach((el: any) => {
      if (el.swiper) el.swiper.destroy(true, true); // clear cũ

      const autoplay = el.dataset.autoplay === "true";
      const delay = parseInt(el.dataset.delay || "3000", 10);

      new frameWin.Swiper(el, {
        loop: true,
        pagination: {
          el: el.querySelector(".swiper-pagination"),
          clickable: true,
        },
        navigation: {
          nextEl: el.querySelector(".swiper-button-next"),
          prevEl: el.querySelector(".swiper-button-prev"),
        },
        autoplay: autoplay ? { delay, disableOnInteraction: false } : false,
      });
    });
  }

  // 🟢 Component Swiper
  domc.addType("swiper", {
    model: {
      defaults: {
        name: "Swiper",
        traits: [
          {
            type: "checkbox",
            name: "autoplay",
            label: "Autoplay",
            changeProp: 1,
          },
          {
            type: "number",
            name: "delay",
            label: "Delay (ms)",
            min: 1000,
            step: 500,
            changeProp: 1,
          },
        ],
        attributes: { "data-autoplay": "true", "data-delay": "3000" },
      },

      init() {
        //@ts-ignore
        this.on("change:autoplay change:delay", () => {
          //@ts-ignore

          this.setAttributes({
            //@ts-ignore

            "data-autoplay": this.get("autoplay") ? "true" : "false",
            //@ts-ignore

            "data-delay": this.get("delay") || "3000",
          });
          // chỉ init lại Swiper khi thay đổi config
          initSwipers();
        });
      },
    },
  });
}
