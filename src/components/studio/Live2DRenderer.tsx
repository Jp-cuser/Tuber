import { useEffect, useRef } from 'react';
import {
  Live2DAdapter,
  type Live2DConfig,
  type Live2DModelHandle,
} from '@/features/avatar/live2d';

interface Live2DRendererProps {
  config: Live2DConfig;
  expression: string;
  motion: { group: string; index: number; requestId: number };
  onReady: () => void;
  onError: (message: string) => void;
}

export function Live2DRenderer({
  config,
  expression,
  motion,
  onReady,
  onError,
}: Live2DRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<Live2DModelHandle>();
  const expressionRef = useRef(expression);

  useEffect(() => {
    expressionRef.current = expression;
  }, [expression]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const adapter = new Live2DAdapter(config, window.location.origin);
    let model: Live2DModelHandle | undefined;
    let disposed = false;
    const observer = new ResizeObserver(() => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      canvas.width = Math.round(width * window.devicePixelRatio);
      canvas.height = Math.round(height * window.devicePixelRatio);
      model?.resize(canvas.width, canvas.height);
    });
    observer.observe(canvas);
    void adapter
      .mount(canvas)
      .then((handle) => {
        if (disposed) return handle.destroy();
        model = handle;
        modelRef.current = handle;
        void handle.setExpression(expressionRef.current);
        onReady();
      })
      .catch((error: unknown) =>
        onError(
          error instanceof Error
            ? error.message
            : 'Unable to load Live2D model',
        ),
      );
    return () => {
      disposed = true;
      observer.disconnect();
      adapter.destroy();
      modelRef.current = undefined;
    };
  }, [config, onError, onReady]);

  useEffect(() => {
    void modelRef.current?.setExpression(expression);
  }, [expression]);

  useEffect(() => {
    if (motion.requestId > 0)
      void modelRef.current?.playMotion(motion.group, motion.index);
  }, [motion]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="Live2D renderer"
    />
  );
}
