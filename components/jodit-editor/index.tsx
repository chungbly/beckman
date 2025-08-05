//@ts-nocheck
"use client";

import { getProducts } from "@/client/product.client";
import { useToast } from "@/hooks/use-toast";
// import Jodit from "jodit-react";
import type { IJodit } from "jodit/esm/types/jodit";
import { useEffect, useMemo, useRef, useState } from "react";
// import ReactDOM from "react-dom/client";
import { useForm } from "@tanstack/react-form";
import { Edit, Trash } from "lucide-react";
import dynamic from "next/dynamic";
import ReactDOMServer from "react-dom/server";
import FileManager from "../file-manager";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import SelectProductModal from "./SelectProductModal";
import ProductScrollAbleList from "./product-scrollable-list";
import "./style.css";
const Jodit = dynamic(() => import("jodit-react"), { ssr: false });
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

type FormValues = {
  isOpenSelectorProductModal: boolean;
  productIds: number[];
  currentBlock: HTMLDivElement | null;
  x: number;
  y: number;
};

export function restoreShortcodesFromPreview(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  container
    .querySelectorAll('[data-type="product-scrollable"]')
    .forEach((el) => {
      el.innerHTML = "";
    });
  return container.innerHTML;
}

const JoditEditor = ({
  placeholder,
  value,
  onChange,
  className,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) => {
  const editor = useRef<IJodit>(null);
  const hiddenEleRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [content, setContent] = useState(value || "");
  const [isOpenLibrary, setIsOpenLibrary] = useState(false);
  const defaultValues: FormValues = {
    isOpenSelectorProductModal: false,
    productIds: [],
    currentBlock: null,
    x: 0,
    y: 0,
  };
  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      if (!editor.current || !editor.current?.selection || !document) {
        return toast({
          title: "Lỗi",
          description: "Editor.current is not defined",
          variant: "error",
        });
      }
      const products = await getProductList(value.productIds);
      const html = ReactDOMServer.renderToStaticMarkup(
        <ProductScrollAbleList
          className="bg-[var(--rose-beige)] p-2 pt-4"
          products={products}
        />
      );
      if (value.currentBlock) {
        value.currentBlock.innerHTML = html;
        value.currentBlock.setAttribute(
          "data-ids",
          JSON.stringify(value.productIds)
        );
      } else {
        editor.current?.selection.insertHTML(
          `<div data-type="product-scrollable" data-ids="${JSON.stringify(
            value.productIds
          )}">
            ${html}
          </div>`
        );
      }

      //@ts-ignore
      form.setFieldValue("productIds", []);
      form.setFieldValue("isOpenSelectorProductModal", false);
    },
  });

  function createTableOfContents() {
    const container = document.querySelector(".jodit-wysiwyg");
    if (!container) return;
    // Find all heading tags (h1 to h6)
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) {
      return;
    }

    // Create an ordered list for the TOC
    const tocList = document.createElement("ol");
    tocList.style.border = "1px solid #e2e8f0";
    tocList.style.padding = "10px";
    tocList.style.borderRadius = "5px";
    const headingCounts = Array(6).fill(0);
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      headingCounts[level - 1]++;
      // Reset numbering for lower levels
      headingCounts.fill(0, level);
      const number = headingCounts.slice(1, level).join(".");
      // Add an ID to each heading if it doesn't already have one
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      // Create a list item for each heading
      const listItem = document.createElement("li");

      // Set the indentation based on heading level
      listItem.style.marginLeft = `${
        (parseInt(heading.tagName[1]) - 1) * 20
      }px`;
      listItem.style.textDecoration = "underline";

      // Create a link to the heading
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = `${number} ${heading.textContent}`;

      // Append the link to the list item
      listItem.appendChild(link);

      // Append the list item to the TOC list
      tocList.appendChild(listItem);
    });
    return tocList;
  }

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder || "",
      height: 500,
      iframeStyle: `
      @import "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";`,
      extraButtons: [
        {
          iconURL: "/icons/image-manager.svg",
          exec: () => {
            if (!editor.current) {
              return toast({
                title: "Lỗi",
                description: "Editor initial is not defined",
                variant: "error",
              });
            }
            setIsOpenLibrary(true);
          },
          tooltip: "Chọn ảnh từ thư viện",
        },
        {
          iconURL: "/icons/table-of-contents.svg",
          exec: (editorO: any) => {
            const tocList = createTableOfContents();
            if (!tocList) return;
            editorO.selection.insertNode(tocList);
          },
          tooltip: "Tạo mục lục",
        },
        {
          iconURL: "/icons/product-scrollable-area.svg",
          exec: (editorO: any) => {
            if (!editor.current) {
              return toast({
                title: "Lỗi",
                description: "Editor initial is not defined",
                variant: "error",
              });
            }
            form.setFieldValue("isOpenSelectorProductModal", true);
          },
          tooltip: "Thêm danh sách sản phẩm",
        },
      ],
      events: {
        afterInit: (editor: IJodit) => {
          editor.editor.addEventListener("contextmenu", (e) => {
            if (!e.target) return;
            const target = (e.target as Element).closest(
              '[data-type="product-scrollable"]'
            );
            if (!target) return;
            const ids = JSON.parse(target.getAttribute("data-ids") || "[]");
            if (target) {
              e.preventDefault();
              form.setFieldValue(
                "x",
                (e.target as Element).getBoundingClientRect().x
              );
              form.setFieldValue(
                "y",
                (e.target as Element).getBoundingClientRect().y
              );
              form.setFieldValue("currentBlock", target as HTMLDivElement);
              form.setFieldValue("productIds", ids);
            }
          });
        },
      },
    }),
    [placeholder, toast]
  );

  const handleSelectImage = (images: string[]) => {
    if (!editor.current || !editor.current?.selection) {
      return toast({
        title: "Lỗi",
        description: "Editor.current is not defined",
        variant: "error",
      });
    }
    setIsOpenLibrary(false);
    images.forEach((image) => {
      editor.current?.selection.insertHTML(
        `<img src="${image}" alt="image" />`
      );
    });
  };

  useEffect(() => {
    if (value) {
      (async () => {
        const div = document.createElement("div");
        div.innerHTML = value;
        const elements = div.querySelectorAll(
          '[data-type="product-scrollable"]'
        );
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          const ids = JSON.parse(el.getAttribute("data-ids") || "[]");
          if (!ids?.length) return;
          const products = await getProductList(ids);
          const html = ReactDOMServer.renderToStaticMarkup(
            <ProductScrollAbleList
              className="bg-[var(--rose-beige)] p-2 pt-4"
              products={products}
            />
          );
          el.innerHTML = html;
        }
        const html = div.innerHTML;
        setContent(html);
        return;
      })();
    }
  }, [value]);

  return (
    <>
      <Jodit
        ref={editor}
        value={content}
        config={config}
        className={className}
        onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
        onChange={(newContent) => {
          onChange?.(newContent);
        }}
      />
      <Dialog open={isOpenLibrary} onOpenChange={() => setIsOpenLibrary(false)}>
        <DialogContent className="max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Thư viện ảnh</DialogTitle>
          </DialogHeader>
          <FileManager onSelect={handleSelectImage} />
        </DialogContent>
      </Dialog>
      <form.Subscribe
        selector={(state) => ({
          isOpenProductModal: state.values.isOpenSelectorProductModal,
          productIds: state.values.productIds,
        })}
      >
        {({ productIds, isOpenProductModal }) => (
          <SelectProductModal
            open={isOpenProductModal}
            productIds={productIds}
            onClose={() => {
              //@ts-nocheck
              form.setFieldValue("isOpenSelectorProductModal", false);
            }}
            onChange={(v) => {
              //@ts-nocheck
              form.setFieldValue("productIds", Array.from(new Set(v)));
            }}
            onSubmit={form.handleSubmit}
          />
        )}
      </form.Subscribe>

      <form.Subscribe
        selector={(state) => ({
          currentBlock: state.values.currentBlock,
          x: state.values.x,
          y: state.values.y,
        })}
      >
        {({ x, y, currentBlock }) => (
          <Dialog
            open={!!x && !!y}
            onOpenChange={() => {
              form.setFieldValue("x", 0);
              form.setFieldValue("y", 0);
              form.setFieldValue("currentBlock", null);
              // form.setFieldValue("productIds", []);
            }}
          >
            <DialogContent
              overlay={false}
              className="translate-x-1/2 translate-y-[100%] w-fit p-2 flex items-center gap-2"
              style={{
                top: y + "px",
                left: x + "px",
              }}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  currentBlock?.remove();
                  form.setFieldValue("currentBlock", null);
                  form.setFieldValue("productIds", []);
                  form.setFieldValue("x", 0);
                  form.setFieldValue("y", 0);
                  editor.current?.synchronizeValues();
                }}
              >
                <Trash className="text-red-500" />
              </Button>
              <Button
                onClick={() => {
                  form.setFieldValue("isOpenSelectorProductModal", true);
                  form.setFieldValue("x", 0);
                  form.setFieldValue("y", 0);
                }}
                size="icon"
                variant="ghost"
              >
                <Edit />
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </form.Subscribe>
    </>
  );
};

export default JoditEditor;
