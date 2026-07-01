import React, { useRef, useState, useEffect, ReactNode, useCallback } from 'react';
import { useDraggable } from '../hooks/useDraggable';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  title?: ReactNode;
}

export const Carousel: React.FC<CarouselProps> = React.memo(({ children, className = "", title }) => {
  const ref = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  useDraggable(ref);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkScrollable = useCallback(() => {
    if (!ref.current) return;
    const { scrollWidth, clientWidth } = ref.current;
    setIsScrollable(scrollWidth > clientWidth);
  }, []);

  const handleScroll = useCallback(() => {
    if (!ref.current || !sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    if (scrollWidth > clientWidth) {
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      sliderRef.current.value = progress.toString();
      sliderRef.current.style.background = `linear-gradient(to right, rgba(16, 185, 129, 0.6) ${progress}%, rgba(255, 255, 255, 0.1) ${progress}%)`;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollable();
      handleScroll();
    }, 150);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [children, checkScrollable, handleScroll]);

  return (
    <div className="relative group/carousel w-full flex flex-col mb-4">
      {title && (
        <div className="flex items-center justify-between mb-3 px-2 mt-2">
          <div className="flex-1">{title}</div>
        </div>
      )}

      <div 
        ref={ref} 
        onScroll={handleScroll}
        className={`flex overflow-x-auto scrollbar-none snap-x ${className} md:pb-2`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {children}
      </div>

      {/* Premium Custom Scrollbar for PC */}
      {isScrollable && (
        <div className="hidden md:flex absolute -bottom-2 left-2 right-2 h-3 items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
          <input 
            ref={sliderRef}
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            onInput={(e) => {
              if (ref.current) {
                // Temporarily remove smooth scroll to prevent slider stuttering when dragging
                ref.current.style.scrollBehavior = 'auto';
                const maxScroll = ref.current.scrollWidth - ref.current.clientWidth;
                ref.current.scrollLeft = (Number((e.target as HTMLInputElement).value) / 100) * maxScroll;
                ref.current.style.scrollBehavior = 'smooth';
              }
            }}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer focus:outline-none custom-slider"
            style={{
              background: `linear-gradient(to right, rgba(16, 185, 129, 0.6) 0%, rgba(255, 255, 255, 0.1) 0%)`
            }}
          />
        </div>
      )}
    </div>
  );
});
