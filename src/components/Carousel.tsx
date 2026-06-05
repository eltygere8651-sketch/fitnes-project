import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  title?: ReactNode;
}

export const Carousel: React.FC<CarouselProps> = React.memo(({ children, className = "", title }) => {
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
    <div className="relative group/carousel w-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between mb-3 px-2 mt-2">
          <div className="flex-1">{title}</div>
          <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <button 
              onClick={() => scrollBy(-400)}
              disabled={!showLeft}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showLeft ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' : 'bg-transparent text-white/20 cursor-default'}`}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>
            <button 
              onClick={() => scrollBy(400)}
              disabled={!showRight}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showRight ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' : 'bg-transparent text-white/20 cursor-default'}`}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      )}
      
      {!title && (
         <>
           <button 
             onClick={() => scrollBy(-400)}
             className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/80 hover:bg-black border border-white/10 text-white backdrop-blur-md opacity-0 sm:group-hover/carousel:opacity-100 transition-all shadow-lg ${showLeft ? '' : 'hidden pointer-events-none'}`}
             aria-label="Anterior"
           >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
           </button>
           <button 
             onClick={() => scrollBy(400)}
             className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/80 hover:bg-black border border-white/10 text-white backdrop-blur-md opacity-0 sm:group-hover/carousel:opacity-100 transition-all shadow-lg ${showRight ? '' : 'hidden pointer-events-none'}`}
             aria-label="Siguiente"
           >
              <ChevronRight className="w-6 h-6 ml-0.5" />
           </button>
         </>
      )}

      <div 
        ref={ref} 
        onScroll={checkArrows}
        className={`flex overflow-x-auto scrollbar-none snap-x ${className}`}
      >
        {children}
      </div>
    </div>
  );
});
