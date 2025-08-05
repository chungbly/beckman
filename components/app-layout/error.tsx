"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  title: string;
  message: string | ReactNode;
  content: ReactNode;
}
function Error({ title, message, content }: Props) {
  return (
    <div className="flex max-w-[400px] h-screen mx-auto py-12 items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ scale: [null, 1, 1.3, 0.8, 1, 0.8, 1] }}
          transition={{ duration: 0.5 }}
        >
          <p className="mt-4 text-4xl font-bold mb-4">{title}</p>
        </motion.div>
        <motion.div
          animate={{ scale: [null, 1, 1.1, 0.9, 1, 0.9, 1] }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-500 text-sm">{message}</p>
        </motion.div>
        <motion.div
          animate={{ scale: [null, 1, 1.1, 0.9, 1, 0.9, 1] }}
          transition={{ duration: 0.6 }}
        >
          <div className="py-4">{content}</div>
        </motion.div>

        <Link href={"/"}>
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}

export default Error;
