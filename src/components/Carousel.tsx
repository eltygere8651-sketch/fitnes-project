import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useDraggable } from '../hooks/useDraggable';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  title?: ReactNode;
}

export const Carousel: React.FC<CarouselProps> = React.memo(({ children, className = "", title }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScroll = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    if (scrollWidth <= clientWidth) {
      setScrollProgress(0);
      setIsScrollable(false);
    } else {
      setIsScrollable(true);
      setScrollProgress((scrollLeft / (scrollWidth - clientWidth)) * 100);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 150);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  return (
    <div className="relative group/carousel w-full flex flex-col mb-4">
      {title && (
        <div className="flex items-center justify-between mb-3 px-2 mt-2">
          <div className="flex-1">{title}</div>
        </div>
      )}

      <div 
        ref={ref} 
        onScroll={checkScroll}
        className={`flex overflow-x-auto scrollbar-none snap-x ${className}`}
      >
        {children}
      </div>

      {/* Premium Custom Scrollbar for PC */}
      {isScrollable && (
        <div className="hidden md:flex absolute -bottom-2 left-2 right-2 h-3 items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
          <input 
            type="range"
            min="0"
            max="100"
            value={scrollProgress || 0}
            onChange={(e) => {
              if (ref.current) {
                const maxScroll = ref.current.scrollWidth - ref.current.clientWidth;
                ref.current.scrollLeft = (Number(e.target.value) / 100) * maxScroll;
              }
            }}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none custom-slider"
            style={{
              background: `linear-gradient(to right, rgba(16, 185, 129, 0.6) ${scrollProgress}%, rgba(255, 255, 255, 0.1) ${scrollProgress}%)`
            }}
          />
        </div>
      )}
    </div>
  );
});
