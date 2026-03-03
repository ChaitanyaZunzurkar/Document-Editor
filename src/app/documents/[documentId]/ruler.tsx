"use client";

import { useRef, useState, useEffect } from "react";
import { FaCaretDown } from "react-icons/fa";

const markers = Array.from({ length: 83 }, (_, i) => i);

export const Ruler = () => {
  const [leftMargin, setLeftMargin] = useState(56);
  const [rightMargin, setRightMargin] = useState(56);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleLeftMouseDown = () => setIsDraggingLeft(true);
  const handleRightMouseDown = () => setIsDraggingRight(true);

  const handleMouseMove = (e: MouseEvent) => {
    if ((isDraggingLeft || isDraggingRight) && rulerRef.current) {
      const container = rulerRef.current.querySelector("#ruler-container");
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        const rawPosition = Math.max(0, Math.min(816, relativeX));

        if (isDraggingLeft) {
          const maxLeftPosition = 816 - rightMargin - 100; // Minimum 100px gap
          const newLeftPosition = Math.min(rawPosition, maxLeftPosition);
          setLeftMargin(newLeftPosition);
        } else if (isDraggingRight) {
          const maxRightMargin = 816 - leftMargin - 100;
          // Calculate margin from the right side
          const newRightMargin = Math.max(0, Math.min(816 - rawPosition, maxRightMargin));
          setRightMargin(newRightMargin);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  };

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  const handleLeftDoubleClick = () => setLeftMargin(56);
  const handleRightDoubleClick = () => setRightMargin(56);

  return (
    <div 
      ref={rulerRef}
      className="w-[816px] mx-auto h-6 border-b border-gray-300 flex items-end relative select-none print:hidden bg-[#F9FBFD]"
    >
      <div 
        id="ruler-container"
        className="w-full h-full relative"
      >
        <div className="absolute inset-x-0 bottom-0 h-full">
          <div className="relative w-[816px] h-full">
            {markers.map((i) => {
              const position = (i * 816) / 82; 
              return (          
                <div
                  key={i}
                  className="absolute bottom-0"
                  style={{ left: `${position}px` }}
                >
                  {i % 10 === 0 ? (
                    <>
                      <div className="absolute bottom-0 h-2 w-[1px] bg-neutral-500" />
                      <span className="absolute bottom-2 text-[10px] text-neutral-500 -translate-x-1/2">
                        {i / 10 + 1}
                      </span>
                    </>
                  ) : i % 5 === 0 ? (
                    <div className="absolute bottom-0 h-1.5 w-[1px] bg-neutral-400" />
                  ) : (
                    <div className="absolute bottom-0 h-1 w-[1px] bg-neutral-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <Marker
          position={leftMargin}
          isLeft={true}
          isDragging={isDraggingLeft}
          onMouseDown={handleLeftMouseDown}
          onDoubleClick={handleLeftDoubleClick}
        />
        <Marker
          position={rightMargin}
          isLeft={false}
          isDragging={isDraggingRight}
          onMouseDown={handleRightMouseDown}
          onDoubleClick={handleRightDoubleClick}
        />
      </div>
    </div>
  );
};

interface MarkerProps {
  position: number;
  isLeft: boolean;
  isDragging: boolean;
  onMouseDown: () => void;
  onDoubleClick: () => void;
}

const Marker = ({ position, isLeft, isDragging, onMouseDown, onDoubleClick }: MarkerProps) => {
  return (
    <div
      className="absolute top-0 w-4 h-full cursor-ew-resize group -ml-2 z-[5]"
      style={{ [isLeft ? "left" : "right"]: `${position}px` }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <FaCaretDown className="fill-blue-600 size-4 absolute top-[-5px] left-1/2 -translate-x-1/2" />
      
      <div 
        className={`absolute left-1/2 top-4 w-[1px] h-[100vh] bg-blue-500 
          ${isDragging ? "block" : "hidden group-hover:block"}`} 
      />
    </div>
  ); 
};