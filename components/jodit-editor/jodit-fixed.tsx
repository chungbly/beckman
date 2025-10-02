"use client";

import { getProducts } from "@/client/product.client";
import type { Config } from "jodit/esm/config";
import type { Jodit as JoditBaseConstructor } from "jodit/esm/index";
import type { DeepPartial } from "jodit/esm/types";
import type { IJodit } from "jodit/esm/types/jodit";
import { forwardRef, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { Jodit } from "./include.jodit";
import ProductScrollAbleList from "./product-scrollable-list";

const getProductList = async (ids: number[]) => {
  const res = await getProducts(
    {
      ids,
    },
    ids.length,
    1
  );
  if (!res || !res.data || res.status !== "OK") {
    return [];
  }
  return res.data;
};

interface Props<T extends typeof JoditBaseConstructor = typeof Jodit> {
  JoditConstructor?: T;
  config?: DeepPartial<Config>;
  className?: string;
  id?: string;
  name?: string;
  onBlur?: (value: string, event: MouseEvent) => void;
  onChange?: (value: string) => void;
  tabIndex?: number;
  value?: string;
  editorRef?: (editor: IJodit) => void;
}

const JoditEditorFixed = forwardRef<IJodit, Props>(
  (
    {
      JoditConstructor = Jodit,
      className,
      config,
      id,
      name,
      onBlur,
      onChange,
      tabIndex,
      value,
      editorRef,
    },
    ref
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const joditRef = useRef<IJodit | null>(null);
    const cacheRef = useRef<Record<string, boolean>>({});

    // init editor
    useEffect(() => {
      const element = textAreaRef.current!;
      const jodit = JoditConstructor.make(element, config);
      joditRef.current = jodit;

      if (typeof editorRef === "function") {
        editorRef(jodit);
      }

      return () => {
        if (jodit.isReady) {
          jodit.destruct();
        } else {
          jodit
            .waitForReady()
            .then((joditInstance) => joditInstance.destruct());
        }
      };
    }, [JoditConstructor, config, editorRef]);

    // ref forwarding
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(joditRef.current);
        } else {
          ref.current = joditRef.current;
        }
      }
    }, [ref]);

    // tabIndex
    useEffect(() => {
      if (joditRef.current?.workplace) {
        joditRef.current.workplace.tabIndex = tabIndex || -1;
      }
    }, [tabIndex]);

    // events
    useEffect(() => {
      const jodit = joditRef.current;
      if (!jodit?.events || !(onBlur || onChange)) {
        return;
      }

      const onBlurHandler = (event: MouseEvent) =>
        onBlur && onBlur(joditRef?.current?.value ?? "", event);

      const onChangeHandler = (val: string) => onChange && onChange(val);

      jodit.events.on("blur", onBlurHandler).on("change", onChangeHandler);

      return () => {
        jodit.events?.off("blur", onBlurHandler).off("change", onChangeHandler);
      };
    }, [onBlur, onChange]);

    // controlled value sync (patched)
    useEffect(() => {
      const update = async () => {
        const jodit = joditRef.current;
        if (!jodit || value === undefined) return;
        if (jodit.value !== value) {
          try {
            jodit.s.save(); // đánh dấu vị trí con trỏ
            const div = document.createElement("div");
            div.innerHTML = value;
            const elements = div.querySelectorAll(
              '[data-type="product-scrollable"]'
            );
            if (!elements || !elements?.length) {
              jodit.value = value; // cập nhật value
              jodit.s.restore(); // khôi phục lại selection
              return;
            }
            let count = 0;
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              jodit.value = value;

              const ids = JSON.parse(el.getAttribute("data-ids") || "[]");
              if (!ids?.length) continue;
              count++;
              const products = await getProductList(ids);
              const html = ReactDOMServer.renderToStaticMarkup(
                <ProductScrollAbleList
                  className="bg-[var(--rose-beige)] p-2 pt-4"
                  products={products}
                />
              );

              el.innerHTML = html;
            }
            if (count === elements.length) {
              const html = div.innerHTML;
              jodit.value = html; // cập nhật value
            } else {
              jodit.value = value;
            }
            jodit.s.restore(); // khôi phục lại selection
          } catch {
            jodit.value = value; // fallback
          }
        }
      };
      update();
    }, [value]);
    return (
      <div className={"jodit-react-container"}>
        <textarea
          defaultValue={value}
          name={name}
          id={id}
          ref={textAreaRef}
          className={className}
        />
      </div>
    );
  }
);

JoditEditorFixed.displayName = "JoditEditorFixed";

export default JoditEditorFixed;
