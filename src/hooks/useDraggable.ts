import { useRef, useEffect, RefObject } from 'react';

export function useDraggable(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    let pos = { top: 0, left: 0, x: 0, y: 0 };
    let isDragging = false;
    let hasDragged = false;

    const mouseDownHandler = (e: MouseEvent) => {
      // Ignore if clicking on the scrollbar
      const rect = ele.getBoundingClientRect();
      if (
        e.clientY - rect.top >= ele.clientHeight || 
        e.clientX - rect.left >= ele.clientWidth
      ) {
        return;
      }

      isDragging = true;
      hasDragged = false;
      ele.style.cursor = 'grabbing';
      ele.style.userSelect = 'none';

      pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        x: e.clientX,
        y: e.clientY,
      };

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }

      ele.scrollTop = pos.top - dy;
      ele.scrollLeft = pos.left - dx;
    };

    const mouseUpHandler = (e: MouseEvent) => {
      isDragging = false;
      ele.style.cursor = 'grab';
      ele.style.removeProperty('user-select');

      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    const clickCaptureHandler = (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const wheelHandler = (e: WheelEvent) => {
      // Allow vertical scroll if holding shift or if it's explicitly a horizontal wheel scroll
      // Actually, standard behavior: if the user scrolls the mouse wheel up/down (deltaY)
      // let's translate that to horizontal scrolling (scrollLeft) if there is room to scroll.
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // We only want to intercept if there's horizontal overflow
        if (ele.scrollWidth > ele.clientWidth) {
          // Check if we are at the edges
          if (
            (e.deltaY < 0 && ele.scrollLeft > 0) ||
            (e.deltaY > 0 && ele.scrollLeft + ele.clientWidth < ele.scrollWidth - 1)
          ) {
            e.preventDefault();
            ele.scrollLeft += e.deltaY;
          }
        }
      }
    };

    ele.addEventListener('mousedown', mouseDownHandler);
    ele.addEventListener('click', clickCaptureHandler, true);
    ele.addEventListener('wheel', wheelHandler, { passive: false });
    ele.style.cursor = 'grab';

    return () => {
      ele.removeEventListener('mousedown', mouseDownHandler);
      ele.removeEventListener('click', clickCaptureHandler, true);
      ele.removeEventListener('wheel', wheelHandler);
    };
  }, [ref]);
}
