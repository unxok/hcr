"use client";

import { HTMLMotionProps, MotionProps, motion } from "framer-motion";
import { Button } from "../ui/button";
import { useRef, useState } from "react";

export const DraggableButton = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  const [pointerEvents, setPointerEvents] = useState("");
  const [containerIndex, setContainerIndex] = useState(0);
  const [hoverContainerIndex, setHoverContainerIndex] = useState(0);

  return (
    <>
      <motion.div
        key={"drag-area"}
        className="w-96 border"
        ref={constraintsRef}
      >
        {[0, 1, 2, 3].map((n) => (
          <motion.div
            key={"drag-over-div-" + n}
            // ref={constraintsRef}
            onDragOver={(e) => {
              console.log("dragged over me");
            }}
            onMouseOver={(e) => pointerEvents && setHoverContainerIndex(n)}
            className="h-52 w-full border p-5"
          >
            drag over me
            {containerIndex === n && (
              <DragButton
                drag={true}
                dragSnapToOrigin={true}
                dragConstraints={constraintsRef}
                onDragEnd={({ clientX, clientY }: MouseEvent) => {
                  console.log("x: ", clientX, "\ny: ", clientY);
                  setPointerEvents("");
                  setContainerIndex(hoverContainerIndex);
                }}
                onDragStart={(e: MouseEvent) =>
                  setPointerEvents("pointer-events-none")
                }
                className={"w-fit " + pointerEvents}
                id={"draggable-button" + containerIndex}
              >
                <Button>Drag me</Button>
              </DragButton>
            )}
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

const DragButton = ({
  dragConstraints,
  onDragEnd,
  onDragStart,
  className,
  id,
}: HTMLMotionProps<"div"> & { id: string | number }) => (
  <motion.div
    drag={true}
    dragConstraints={dragConstraints}
    onDragEnd={onDragEnd}
    onDragStart={onDragStart}
    className={className}
    key={id}
  >
    <Button>Drag me</Button>
  </motion.div>
);
