"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useRef } from "react";

export const DraggableButton = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div ref={constraintsRef} className="h-96 w-96 border">
      <motion.div drag dragConstraints={constraintsRef}>
        <Button>Drag me</Button>
      </motion.div>
    </motion.div>
  );
};
