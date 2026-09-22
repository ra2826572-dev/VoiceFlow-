import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying?: boolean;
  isRecording?: boolean;
  barCount?: number;
  height?: number;
  accentColor?: string;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying = false,
  isRecording = false,
  barCount = 36,
  height = 48,
  accentColor = '#8B5CF6',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const barWidth = Math.max(2, (width / barCount) - 3);
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 3);
        let amplitude = 0.15; // idle height

        if (isPlaying) {
          const wave1 = Math.sin(phase * 3 + i * 0.35);
          const wave2 = Math.cos(phase * 2 + i * 0.2);
          amplitude = Math.abs(wave1 * 0.6 + wave2 * 0.4);
          amplitude = Math.max(0.12, Math.min(0.95, amplitude));
        } else if (isRecording) {
          const wave = Math.sin(phase * 4 + i * 0.5);
          amplitude = Math.abs(wave * 0.75 + Math.random() * 0.25);
          amplitude = Math.max(0.15, Math.min(1.0, amplitude));
        }

        const barHeight = Math.max(4, amplitude * (canvas.height - 8));
        const y = centerY - barHeight / 2;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          grad.addColorStop(0, '#EF4444');
          grad.addColorStop(1, '#F87171');
        } else if (isPlaying) {
          grad.addColorStop(0, '#A855F7');
          grad.addColorStop(0.5, '#6366F1');
          grad.addColorStop(1, '#3B82F6');
        } else {
          grad.addColorStop(0, '#94A3B8');
          grad.addColorStop(1, '#64748B');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += 0.04;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isRecording, barCount]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
