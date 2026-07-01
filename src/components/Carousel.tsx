import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  title?: ReactNode;
  hideScrollbar?: boolean;
}

export const Carousel: React.FC<CarouselProps> = React.memo(({ children, className = "", title, hideScrollbar = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDraggable(ref);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkArrows = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    // Initial check
    const timer = setTimeout(checkArrows, 150);
    window.addEventListener('resize', checkArrows);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkArrows);
    };
  }, [children]);

  const scrollBy = (offset: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/carousel w-full flex flex-col mb-4">
      {title && (
        <div className="flex items-center justify-between mb-3 px-2 mt-2">
          <div className="flex-1">{title}</div>
        </div>
      )}
      
      {!title && (
         <>
           <button 
             onClick={() => scrollBy(-400)}
             className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/80 hover:bg-black border border-white/10 text-white backdrop-blur-md opacity-0 md:hidden sm:group-hover/carousel:opacity-100 transition-all shadow-lg ${showLeft ? '' : 'hidden pointer-events-none'}`}
             aria-label="Anterior"
           >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
           </button>
           <button 
             onClick={() => scrollBy(400)}
             className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/80 hover:bg-black border border-white/10 text-white backdrop-blur-md opacity-0 md:hidden sm:group-hover/carousel:opacity-100 transition-all shadow-lg ${showRight ? '' : 'hidden pointer-events-none'}`}
             aria-label="Siguiente"
           >
              <ChevronRight className="w-6 h-6 ml-0.5" />
           </button>
         </>
      )}

      <div 
        ref={ref} 
        onScroll={checkArrows}
        className={`flex overflow-x-auto ${hideScrollbar ? 'no-scrollbar' : 'max-md:no-scrollbar md:premium-scrollbar md:pb-3'} snap-x ${className}`}
      >
        {children}
      </div>
    </div>
  );
});
