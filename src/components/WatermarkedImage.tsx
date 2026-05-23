import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import type { ReactEventHandler } from 'react';
import { buildCmsAssetCandidates } from '@contracts/cms';

type ImageStatus = 'loading' | 'loaded' | 'error';

type WatermarkedImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  onError?: ReactEventHandler<HTMLImageElement>;
  watermarkStyle?: 'badge' | 'vertical';
};

export default function WatermarkedImage({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  decoding = 'async',
  onError,
  watermarkStyle = 'badge',
}: WatermarkedImageProps) {
  const candidates = useMemo(() => {
    const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    return buildCmsAssetCandidates(src, { runtimeOrigin });
  }, [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [status, setStatus] = useState<ImageStatus>(src ? 'loading' : 'error');

  useEffect(() => {
    setCandidateIndex(0);
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  const currentSrc = candidates[candidateIndex] || src;
  const showFallback = status !== 'loaded';

  return (
    <div className={clsx('relative overflow-hidden bg-[#08111d]', className)}>
      <div
        className={clsx(
          'pointer-events-none absolute inset-0 transition-opacity duration-300',
          showFallback ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(157,188,146,0.18),transparent_32%),linear-gradient(135deg,#09111d_0%,#0c1d17_52%,#08111d_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <div className="max-w-[82%] rounded-[1.1rem] border border-white/10 bg-black/22 px-4 py-3 backdrop-blur-sm">
            <div className="text-[9px] font-semibold uppercase tracking-[0.34em] text-white/72">DUNASAVA</div>
            <div className="mt-2 text-sm font-medium leading-6 text-white/84">{alt}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/58">Görsel yüklenemedi</div>
          </div>
        </div>
      </div>
      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        className={clsx(
          'h-full w-full object-cover transition-opacity duration-300',
          showFallback ? 'opacity-0' : 'opacity-100',
          imgClassName
        )}
        loading={loading}
        decoding={decoding}
        draggable={false}
        onLoad={() => setStatus('loaded')}
        onError={(event) => {
          setCandidateIndex((currentIndex) => {
            const nextIndex = currentIndex + 1;
            if (nextIndex < candidates.length) {
              setStatus('loading');
              return nextIndex;
            }

            setStatus('error');
            onError?.(event);
            return currentIndex;
          });
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />
      {watermarkStyle === 'badge' ? (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur-sm">
          <span className="text-[9px] font-semibold tracking-[0.3em] text-white/75">DUNASAVA</span>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[68px] bg-gradient-to-l from-black/20 via-black/8 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[68px] items-center justify-center">
            <span className="rotate-180 whitespace-nowrap text-[10px] font-semibold tracking-[0.42em] text-white/72 [writing-mode:vertical-rl]">
              DUNASAVA
            </span>
          </div>
          <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-black/18 px-2.5 py-1 backdrop-blur-sm">
            <span className="text-[8px] font-semibold tracking-[0.24em] text-white/72">DUNASAVA</span>
          </div>
        </>
      )}
    </div>
  );
}
