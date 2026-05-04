import { memo, useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { DomEditLayerItem } from "./domEditing";

interface TimelineLayerPanelProps {
  clipLabel: string;
  layers: DomEditLayerItem[];
  selectedLayerKey: string | null;
  onSelectLayer: (layer: DomEditLayerItem) => void;
  onClose: () => void;
}

export const TimelineLayerPanel = memo(function TimelineLayerPanel({
  clipLabel,
  layers,
  selectedLayerKey,
  onSelectLayer,
  onClose,
}: TimelineLayerPanelProps) {
  const childCount = Math.max(0, layers.length - 1);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const clampPosition = useCallback(
    (nextX: number, nextY: number) => {
      const panel = panelRef.current;
      if (!panel) return { x: nextX, y: nextY };

      const rect = panel.getBoundingClientRect();
      const margin = 12;
      const minX = margin - rect.left + position.x;
      const minY = margin - rect.top + position.y;
      const maxX = window.innerWidth - margin - rect.right + position.x;
      const maxY = window.innerHeight - margin - rect.bottom + position.y;

      return {
        x: Math.min(maxX, Math.max(minX, nextX)),
        y: Math.min(maxY, Math.max(minY, nextY)),
      };
    },
    [position.x, position.y],
  );

  const handleDragStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: position.x,
        startY: position.y,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [position.x, position.y],
  );

  const handleDragMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      setPosition(
        clampPosition(
          drag.startX + event.clientX - drag.startClientX,
          drag.startY + event.clientY - drag.startClientY,
        ),
      );
    },
    [clampPosition],
  );

  const handleDragEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto absolute left-3 top-3 z-[100] w-[280px] max-w-[calc(100%-24px)] overflow-hidden rounded-xl border border-white/10 bg-neutral-950/92 shadow-2xl shadow-black/40 backdrop-blur-md"
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div
        className="flex cursor-grab touch-none select-none items-start justify-between gap-3 border-b border-white/10 px-3 py-3 active:cursor-grabbing"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Clip layers
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-neutral-100">{clipLabel}</div>
        </div>
        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={onClose}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/20 text-neutral-500 transition-colors hover:border-white/20 hover:text-neutral-200"
          aria-label="Close clip layers"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      <div className="border-b border-white/10 px-3 py-2 text-[11px] text-neutral-500">
        {childCount > 0
          ? `${childCount} nested selectable layer${childCount === 1 ? "" : "s"}`
          : "No nested layers"}
      </div>
      <div className="max-h-[320px] overflow-y-auto py-1">
        {layers.map((layer) => {
          const selected = layer.key === selectedLayerKey;
          return (
            <button
              key={layer.key}
              type="button"
              data-timeline-layer-row={layer.key}
              onPointerDown={(event) => {
                event.stopPropagation();
                onSelectLayer(layer);
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectLayer(layer);
              }}
              className={`group flex w-full items-center gap-2 px-2.5 py-1.5 text-left transition-colors ${
                selected
                  ? "bg-studio-accent/14 text-studio-accent"
                  : "text-neutral-300 hover:bg-white/[0.04] hover:text-neutral-100"
              }`}
              style={{ paddingLeft: 10 + layer.depth * 14 }}
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border text-[9px] font-bold uppercase ${
                  selected
                    ? "border-studio-accent/50 bg-studio-accent/18"
                    : "border-white/10 bg-black/20 text-neutral-500 group-hover:text-neutral-300"
                }`}
              >
                {layer.tagName.slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{layer.label}</span>
              {layer.childCount > 0 && (
                <span className="rounded-full border border-white/10 bg-black/25 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-neutral-500">
                  {layer.childCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
