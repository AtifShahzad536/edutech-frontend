import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { useVirtualScroll } from '@/utils/lazyLoad';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

function VirtualListComponent<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    virtualItems,
    totalHeight,
    onScroll,
  } = useVirtualScroll(items, itemHeight, containerHeight);

  // Handle scroll events with debouncing
  const debouncedScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolling(true);
    onScroll(e);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set new timeout to detect when scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [onScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflow: 'auto',
    position: 'relative' as const,
  }), [containerHeight]);

  const contentStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative' as const,
  }), [totalHeight]);

  const virtualItemsWithOverscan = useMemo(() => {
    if (virtualItems.length === 0) return [];
    const start = Math.max(0, virtualItems[0]?.index - overscan);
    const end = Math.min(
      items.length,
      virtualItems[virtualItems.length - 1]?.index + 1 + overscan
    );
    
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
    }));
  }, [virtualItems, items, overscan]);

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={containerStyle}
      onScroll={debouncedScroll}
    >
      <div style={contentStyle}>
        {virtualItemsWithOverscan.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
              opacity: isScrolling ? 0.8 : 1,
              transition: isScrolling ? 'opacity 0.1s' : 'none',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export const VirtualList = memo(VirtualListComponent) as typeof VirtualListComponent;

// Hook for infinite scrolling
export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMore: boolean,
  threshold = 0.8
) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= threshold) {
      setIsLoading(true);
      try {
        await loadMore();
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { containerRef, isLoading };
};

// Optimized grid virtual list
interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  containerHeight: number;
  containerWidth: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
}

export const VirtualGrid = memo<VirtualGridProps<any>>(function VirtualGridComponent({
  items,
  itemHeight,
  itemWidth,
  containerHeight,
  containerWidth,
  renderItem,
  gap = 0,
  className = '',
}) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const columns = Math.floor(containerWidth / (itemWidth + gap));
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap);

  const visibleStartRow = Math.floor(scrollTop / (itemHeight + gap));
  const visibleEndRow = Math.min(
    rows,
    visibleStartRow + Math.ceil(containerHeight / (itemHeight + gap)) + 2
  );

  const visibleStartCol = Math.floor(scrollLeft / (itemWidth + gap));
  const visibleEndCol = Math.min(
    columns,
    visibleStartCol + Math.ceil(containerWidth / (itemWidth + gap)) + 2
  );

  const virtualItems = useMemo(() => {
    const result: Array<{ item: any; index: number; row: number; col: number }> = [];
    
    for (let row = visibleStartRow; row < visibleEndRow; row++) {
      for (let col = visibleStartCol; col < visibleEndCol; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          result.push({
            item: items[index],
            index,
            row,
            col,
          });
        }
      }
    }
    
    return result;
  }, [items, columns, visibleStartRow, visibleEndRow, visibleStartCol, visibleEndCol]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`virtual-grid ${className}`}
      style={{
        height: containerHeight,
        width: containerWidth,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          width: columns * (itemWidth + gap),
          position: 'relative',
        }}
      >
        {virtualItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});
