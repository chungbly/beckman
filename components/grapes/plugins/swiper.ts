// custom-swiper.ts
export default function customSwiperPlugin(editor: any) {
  const bm = editor.Blocks;

  // ✅ Dùng chữ ký 2 tham số: add('id', opts)
  bm.add('custom-swiper', {
    label: 'Swiper',
    category: 'Extra',
    media:
      `<svg viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none"/>
        <path d="M7 12h10M12 7v10" stroke="currentColor"/>
      </svg>`,
    // Root component mang data-gjs-type để gắn script/traits
    content: `
      <div data-gjs-type="custom-swiper" class="gjs-custom-swiper">
        <div class="swiper">
          <div class="swiper-wrapper">
            <div class="swiper-slide">Slide 1</div>
            <div class="swiper-slide">Slide 2</div>
            <div class="swiper-slide">Slide 3</div>
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      </div>
    `,
    activate: true,
  });

  // ✅ Đăng ký component type để có traits + init Swiper bên trong canvas
  editor.Components.addType('custom-swiper', {
    model: {
      defaults: {
        name: 'Custom Swiper',
        // Cho phép chọn/thả/bắt resize
        draggable: true,
        droppable: '.swiper-wrapper',
        resizable: true,
        // Thuộc tính có thể chỉnh trong Settings (Traits)
        traits: [
          { type: 'checkbox', name: 'loop', label: 'Loop', changeProp: 1, default: true },
          { type: 'checkbox', name: 'autoplay', label: 'Autoplay', changeProp: 1, default: false },
          { type: 'number',   name: 'delay', label: 'Delay (ms)', changeProp: 1, default: 3000 },
        ],
        // Truyền props vào script
        'script-props': ['loop', 'autoplay', 'delay'],

        // ✅ Script chạy trong iframe của canvas, không phụ thuộc domain/license
        script: function(props: { loop?: boolean; autoplay?: boolean; delay?: number }) {
          // `this` là HTMLElement gốc của component
          const root = this as HTMLElement;

          // Tải Swiper từ CDN nếu chưa có
          function ensureSwiperLoaded(cb: () => void) {
            const win = root.ownerDocument!.defaultView as any;
            const doc = root.ownerDocument as Document;

            if (win && win.Swiper) return cb();

            // inject CSS (nếu chưa có)
            if (!doc.querySelector('link[data-swiper]')) {
              const link = doc.createElement('link');
              link.setAttribute('data-swiper', '1');
              link.rel = 'stylesheet';
              link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
              doc.head.appendChild(link);
            }

            // inject JS (nếu chưa có)
            if (!doc.querySelector('script[data-swiper]')) {
              const s = doc.createElement('script');
              s.setAttribute('data-swiper', '1');
              s.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
              s.onload = () => cb();
              doc.body.appendChild(s);
            } else {
              // Có script rồi nhưng chưa load xong → đợi 1 nhịp
              const tryLater = () => {
                const w = root.ownerDocument!.defaultView as any;
                if (w && w.Swiper) cb();
                else setTimeout(tryLater, 100);
              };
              tryLater();
            }
          }

          function initSwiper() {
            const win = root.ownerDocument!.defaultView as any;
            const container = root.querySelector('.swiper') as HTMLElement;
            if (!container) return;

            // Xóa instance cũ nếu có
            const anyContainer = container as any;
            if (anyContainer.__swiperInstance) {
              anyContainer.__swiperInstance.destroy(true, true);
              anyContainer.__swiperInstance = null;
            }

            const options: any = {
              loop: !!props.loop,
              pagination: { el: root.querySelector('.swiper-pagination') },
              navigation: {
                nextEl: root.querySelector('.swiper-button-next'),
                prevEl: root.querySelector('.swiper-button-prev'),
              },
            };

            if (props.autoplay) {
              options.autoplay = { delay: Number(props.delay) || 3000 };
            }

            const instance = new win.Swiper(container, options);
            anyContainer.__swiperInstance = instance;
          }

          ensureSwiperLoaded(initSwiper);

          // Lắng nghe khi DOM con thay đổi (thêm/xóa slide) để re-init
          const mo = new MutationObserver(() => {
            initSwiper();
          });
          const wrapper = root.querySelector('.swiper-wrapper');
          if (wrapper) {
            mo.observe(wrapper, { childList: true, subtree: false });
          }
        },
      },

      // Khi đổi trait → re-render script
      init() {
        this.on('change:loop change:autoplay change:delay', () => {
          // ép re-render script
          const scr = this.get('script');
          this.set('script', '');
          this.set('script', scr);
        });
      },
    },
  });
}
