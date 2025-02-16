import React from 'react';

import './image.scss';

interface ImageProps {
  path: string;
  objectFit?: 'cover';
  objectPosition?: string;
  className?: string;
  onClick?: () => void;
}

export default function Image({path, objectFit, objectPosition, className, onClick}: ImageProps) {
  return (
    <img
      className={`image ${className}`}
      style={{
        objectFit,
        objectPosition
      }}
      onClick={onClick}
      src={path}/>
  );
}