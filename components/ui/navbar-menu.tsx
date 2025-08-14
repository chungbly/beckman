"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  className,
  menuTrigger,
  style,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  menuTrigger?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  href?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      onMouseEnter={() => setActive(item)}
      className="relative"
      style={style}
    >
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer  hover:opacity-[0.9] dark:text-white "
      >
        {menuTrigger}
      </motion.p>
      {active === item && (
        <div className="h-10 absolute top-[100%] left-0 w-screen translate-x-[-50%] bg-transparent" />

      )}
      <div className="fixed top-20 left-0 right-0 w-screen bg-white">
        {active !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={transition}
          >
            {active === item && (
              <div className="">
                <motion.div
                  transition={transition}
                  layoutId="active" // layoutId ensures smooth animation
                  className=" dark:bg-black backdrop-blur-sm "
                >
                  <motion.div
                    layout // layout ensures smooth animation
                    className={cn("w-max h-full p-1 ", className)}
                  >
                    {children}
                  </motion.div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const SubMenuItem = ({
  active,
  setActive,
  item,
  children,
  className,
  style,
  subMenuTrigger,
}: {
  active: string | null;
  setActive: (item: string | null) => void;
  item: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  subMenuTrigger?: React.ReactNode;
}) => {
  return (
    <div
      onMouseEnter={() => setActive(item)}
      onMouseLeave={() => setActive(null)}
      className="relative"
      style={style}
    >
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
      >
        {subMenuTrigger}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute translate-x-[98%] top-0 right-0">
              <motion.div
                transition={transition}
                layoutId="submenu" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-md border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className={cn("w-max h-full p-1", className)}
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
  className,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className={cn("relative shadow-input flex justify-center", className)}
    >
      {children}
    </nav>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </Link>
  );
};
