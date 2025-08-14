"use client";
import { SizeSelectorProps } from "@/components/product/size-selector";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { AnimatePresence, AnimationControls, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};
function MobileSizeSelector({
  sizes,
  selectedSize,
  selectedColor,
  onSelect,
  variants,
  handleAddToCart,
  controls,
  product,
}: SizeSelectorProps & {
  handleAddToCart: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  controls: AnimationControls;
  product: Product;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (ref?.current && !ref?.current.contains(ev.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [ref]);

  return (
    <div ref={ref}>
      {isOpen && (
        <motion.button
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 90 }}
          exit={{ opacity: 0, width: 0 }}
          transition={transition}
          onClick={handleAddToCart}
          className={cn(
            "sm:hidden w-[90px] h-[60px]  flex items-center justify-center bg-[#36454F] bg-opacity-40 fixed bottom-6 right-56 rounded-full z-10"
          )}
        >
          <Image
            src="/icons/add-to-cart.svg"
            width={54}
            height={40}
            alt="shopping"
            className="text-white "
          />
        </motion.button>
      )}
      {isOpen && (
        <motion.button
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 90 }}
          exit={{ opacity: 0, width: 0 }}
          transition={transition}
          onClick={() => {
            setIsOpen(false);
            const scrollToTop = document.getElementById("scroll-to-top");
            if (scrollToTop) {
              scrollToTop.style.display = "none";
            }
          }}
          className={cn(
            "sm:hidden w-[60px] h-[60px]  flex items-center justify-center bg-[#36454F] bg-opacity-40 fixed bottom-6 right-6 rounded-full z-20"
          )}
        >
          <X width={33} height={33} className="text-white " />
        </motion.button>
      )}
      <div
        className={cn(
          "sm:hidden w-[90px] h-[60px] transition-all duration-300 flex items-center justify-center bg-[#CD7F32] bg-opacity-40 fixed bottom-6 right-6 rounded-full z-20",
          isOpen && "right-32"
        )}
      >
        <Image
          src="/icons/shopping.svg"
          width={33}
          height={40}
          alt="shopping"
          className={cn("text-white")}
          onClick={() => {
            setIsOpen(!isOpen);
            const scrollToTop = document.getElementById("scroll-to-top");
            if (scrollToTop) {
              scrollToTop.style.display = !isOpen ? "none" : "flex";
            }
          }}
        />
      </div>
      <div
        className={cn(
          "sm:hidden w-[90px] h-[60px] transition-all duration-300 flex items-center justify-center fixed bottom-6 right-6 rounded-full z-10"
        )}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="filter"
              initial={{ opacity: 0, top: -8, y: "-90%" }}
              animate={{ opacity: 1, top: -16, y: "-100%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={transition}
              className="absolute right-0 max-w-[350px] overflow-y-auto scrollbar-hide flex backdrop-blur-sm h-[60px] bg-black/30 rounded-[30px] gap-4 px-1"
            >
              {sizes.map((size) => {
                const isAvailable = selectedColor
                  ? variants?.some(
                      (variant) =>
                        variant.size === size &&
                        variant.color === selectedColor &&
                        variant.stock > 0
                    )
                  : true;
                return (
                  <div
                    key={size}
                    onClick={() => {
                      if (isAvailable) {
                        onSelect(size);
                      }
                    }}
                    className="flex items-center justify-center relative"
                  >
                    <div
                      className={cn(
                        "relative w-[50px] h-[50px] flex items-center text-center justify-center  text-white transition-all",
                        !isAvailable && "opacity-50"
                      )}
                    >
                      {selectedSize === size && (
                        <>
                          <motion.div
                            className="absolute z-[9999]"
                            animate={controls}
                            initial={{ opacity: 0, display: "none" }}
                          >
                            <Image
                              src={product.seo?.thumbnail || ""}
                              alt={product.name}
                              width={100}
                              height={100}
                              className="object-cover rounded-lg"
                            />
                          </motion.div>
                          <motion.div
                            layoutId="highlight"
                            className="absolute inset-0 bg-white/30 rounded-full"
                            transition={{
                              type: "tween",
                              stiffness: 100,
                              damping: 50,
                            }}
                          />
                        </>
                      )}
                      {size}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MobileSizeSelector;
