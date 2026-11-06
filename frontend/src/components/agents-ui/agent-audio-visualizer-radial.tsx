import { type ComponentProps, type CSSProperties, useMemo, useEffect, useState } from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { type LocalAudioTrack, type RemoteAudioTrack } from 'livekit-client';
import {
  type AgentState,
  type TrackReferenceOrPlaceholder,
  useMultibandTrackVolume,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { useAgentAudioVisualizerRadialAnimator } from '@/hooks/agents-ui/use-agent-audio-visualizer-radial';

/**
 * Resizes an array of per-band volume values to exactly `count` entries.
 * Excess values are trimmed from the end; if there are too few, the last
 * value is duplicated to fill the remainder. An empty array is padded with 0s.
 */
export function normalizeVolumeBands(bands: number[], count: number): number[] {
  if (bands.length === count) return bands;
  if (bands.length > count) return bands.slice(0, count);
  const lastValue = bands[bands.length - 1] ?? 0;
  return [...bands, ...new Array(count - bands.length).fill(lastValue)];
}

export const AgentAudioVisualizerRadialVariants = cva(
  [
    'relative flex items-center justify-center',
    '**:data-lk-index:bg-current/20',
    '**:data-lk-index:absolute **:data-lk-index:top-1/2 **:data-lk-index:left-1/2 **:data-lk-index:origin-bottom **:data-lk-index:-translate-x-1/2',
    '**:data-lk-index:rounded-full **:data-lk-index:transition-all **:data-lk-index:duration-150 **:data-lk-index:ease-linear **:data-lk-index:data-[lk-highlighted=true]:bg-current',
    'has-data-[lk-state=connecting]:**:data-lk-index:duration-300',
    'has-data-[lk-state=initializing]:**:data-lk-index:duration-300',
    'has-data-[lk-state=listening]:**:data-lk-index:duration-300',
    'has-data-[lk-state=thinking]:animate-spin has-data-[lk-state=thinking]:[animation-duration:5s] has-data-[lk-state=thinking]:**:data-lk-index:bg-current',
  ],
  {
    variants: {
      size: {
        icon: ['h-[24px] gap-[2px]'],
        sm: ['h-[56px] gap-[4px]'],
        md: ['h-[112px] gap-[8px]'],
        lg: ['h-[224px] gap-[16px]'],
        xl: ['h-[448px] gap-[32px]'],
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface AgentAudioVisualizerRadialProps {
  size?: 'icon' | 'sm' | 'md' | 'lg' | 'xl';
  state?: AgentState;
  color?: `#${string}` | string;
  radius?: number;
  barCount?: number;
  audioTrack?: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder;
  volumeBands?: number[];
  className?: string;
}

export function AgentAudioVisualizerRadial({
  size = 'md',
  state = 'speaking',
  color = '#04A43A',
  radius,
  barCount,
  audioTrack,
  volumeBands,
  className,
  style,
  ...props
}: AgentAudioVisualizerRadialProps &
  ComponentProps<'div'> &
  VariantProps<typeof AgentAudioVisualizerRadialVariants>) {
  const _barCount = useMemo(() => {
    if (barCount) {
      return barCount;
    }
    switch (size) {
      case 'icon':
      case 'sm':
        return 12;
      default:
        return 24;
    }
  }, [barCount, size]);

  // Fallback dynamic wave simulation when no WebRTC track is attached
  const [syntheticBands, setSyntheticBands] = useState<number[]>(() =>
    new Array(_barCount).fill(0.1)
  );

  useEffect(() => {
    if (audioTrack || volumeBands) return;

    let frameId: number;
    const updateSynthetic = (time: number) => {
      if (state === 'speaking') {
        const bands = Array.from({ length: _barCount }, (_, i) => {
          const wave = Math.sin(time * 0.008 + i * 0.4) * 0.5 + 0.5;
          const jitter = Math.sin(time * 0.02 + i) * 0.2;
          return Math.max(0.15, Math.min(1, wave * 0.7 + jitter));
        });
        setSyntheticBands(bands);
      } else if (state === 'listening') {
        const bands = Array.from({ length: _barCount }, (_, i) => {
          const wave = Math.sin(time * 0.004 + i * 0.2) * 0.2 + 0.25;
          return wave;
        });
        setSyntheticBands(bands);
      } else {
        setSyntheticBands(new Array(_barCount).fill(0.08));
      }
      frameId = requestAnimationFrame(updateSynthetic);
    };

    frameId = requestAnimationFrame(updateSynthetic);
    return () => cancelAnimationFrame(frameId);
  }, [audioTrack, volumeBands, state, _barCount]);

  let multibandVolume: number[] = [];
  try {
    if (audioTrack) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      multibandVolume = useMultibandTrackVolume(audioTrack, {
        bands: _barCount,
        loPass: 100,
        hiPass: 200,
      });
    }
  } catch {
    multibandVolume = [];
  }

  const resolvedVolumeBands = volumeBands
    ? normalizeVolumeBands(volumeBands, _barCount)
    : multibandVolume.length > 0
    ? multibandVolume
    : syntheticBands;

  const sequencerInterval = useMemo(() => {
    switch (state) {
      case 'connecting':
      case 'listening':
        return 500;
      case 'initializing':
        return 250;
      case 'thinking':
        return Infinity;
      default:
        return 1000;
    }
  }, [state]);

  const distanceFromCenter = useMemo(() => {
    if (radius) {
      return radius;
    }
    switch (size) {
      case 'icon':
        return 6;
      case 'xl':
        return 128;
      case 'lg':
        return 64;
      case 'sm':
        return 16;
      case 'md':
      default:
        return 32;
    }
  }, [size, radius]);

  const highlightedIndices = useAgentAudioVisualizerRadialAnimator(
    state,
    _barCount,
    sequencerInterval,
  );

  const dotSize = useMemo(() => {
    return (distanceFromCenter * Math.PI) / _barCount;
  }, [distanceFromCenter, _barCount]);

  return (
    <div
      data-lk-state={state}
      className={cn(AgentAudioVisualizerRadialVariants({ size }), 'relative', className)}
      style={{ ...style, color } as CSSProperties}
      {...props}
    >
      {resolvedVolumeBands.map((band, idx) => {
        const angle = (idx / _barCount) * Math.PI * 2;
        const isHighlighted = highlightedIndices.includes(idx);
        const barHeight =
          state === 'speaking'
            ? Math.max(dotSize, dotSize * 7 * band)
            : state === 'listening'
            ? Math.max(dotSize, dotSize * 3 * band)
            : dotSize;

        return (
          <div
            key={`${_barCount}-${idx}`}
            data-lk-state={state}
            className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${angle}rad) translateY(${distanceFromCenter}px)`,
            }}
          >
            <div
              data-lk-index={idx}
              data-lk-highlighted={isHighlighted}
              style={{
                width: dotSize,
                minHeight: dotSize,
                height: `${barHeight}px`,
                backgroundColor: isHighlighted || state === 'speaking' ? color : undefined,
                boxShadow: isHighlighted || state === 'speaking' ? `0 0 12px ${color}88` : undefined,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default AgentAudioVisualizerRadial;

