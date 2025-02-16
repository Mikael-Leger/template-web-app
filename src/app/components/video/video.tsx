import React from 'react';

import './video.scss';

interface VideoProps {
  path: string;
  objectFit?: 'cover';
  objectPosition?: string;
  className?: string;
  onClick?: () => void;
}

export default function Video({path, objectFit, objectPosition, className, onClick}: VideoProps) {
  return (
    <video
      className={`video ${className}`}
      style={{
        objectFit,
        objectPosition
      }}
      onClick={onClick}
      src={path}
      autoPlay
      loop
      muted
      playsInline/>
  );
}