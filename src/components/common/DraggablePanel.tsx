import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

export function DraggablePanel({
  children,
  initial = { x: 24, y: 88 },
}: {
  children: ReactNode;
  initial?: { x: number; y: number };
}) {
  const [position, setPosition] = useState(initial);
  const [size, setSize] = useState({ width: 280, height: 190 });
  const origin = useRef<{ x: number; y: number; left: number; top: number }>();

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    origin.current = {
      x: event.clientX,
      y: event.clientY,
      left: position.x,
      top: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (!origin.current) return;
    setPosition({
      x: Math.max(0, origin.current.left + event.clientX - origin.current.x),
      y: Math.max(0, origin.current.top + event.clientY - origin.current.y),
    });
  };

  return (
    <section
      className="absolute z-30 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/75 shadow-2xl backdrop-blur-xl"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        resize: 'both',
      }}
      data-testid="draggable-panel"
    >
      <div
        className="cursor-move select-none border-b border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={() => (origin.current = undefined)}
      >
        Drag
      </div>
      <div className="h-[calc(100%-33px)] overflow-auto p-4">{children}</div>
      <button
        className="sr-only"
        onClick={() => setSize({ width: 360, height: 240 })}
      >
        Resize panel
      </button>
    </section>
  );
}
