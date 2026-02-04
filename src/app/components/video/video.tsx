import React from 'react';

import './video.scss';

interface VideoProps {
  path: string;
  width?: string;
  height?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  onClick?: () => void;
  isEditing?: boolean;
}

// Check if URL is a GIF (image format, not video)
function isGifUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.gif') || lowerUrl.includes('.gif?') || lowerUrl.includes('/giphy.gif');
}

// Convert aspect ratio string to CSS value
function getAspectRatioStyle(ratio?: string): string | undefined {
  if (!ratio || ratio === 'auto') return undefined;
  return ratio.replace(':', '/');
}

export default function Video({
  path,
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  objectPosition,
  autoplay = true,
  muted = true,
  loop = true,
  controls = false,
  className,
  onClick,
  isEditing,
}: VideoProps) {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (aspectRatio !== 'auto' ? 'auto' : undefined),
    aspectRatio: getAspectRatioStyle(aspectRatio),
    objectFit,
    objectPosition,
  };

  // GIFs are images, not videos - render as img element
  if (isGifUrl(path)) {
    return (
      <img
        className={`video ${className || ''}`}
        style={style}
        onClick={onClick}
        src={path}
        alt=""
      />
    );
  }

  // Show placeholder in editor when no path
  if (!path && isEditing) {
    return (
      <div
        className={`video video-placeholder ${className || ''}`}
        style={style}
      >
        <span>Add a video URL</span>
      </div>
    );
  }

  // Force re-render when controls change by using key
  const videoKey = `${path}-${controls}`;

  return (
    <video
      key={videoKey}
      className={`video ${className || ''}`}
      style={style}
      onClick={onClick}
      src={path || undefined}
      autoPlay={Boolean(autoplay)}
      loop={Boolean(loop)}
      muted={Boolean(muted)}
      controls={Boolean(controls)}
      playsInline
    />
  );
}