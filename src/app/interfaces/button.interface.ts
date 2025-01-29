import React from 'react';

import { Type } from '../types/type';

export interface ButtonInterface {
  title?: string;
  icon?: {
    orientation?: 'start' | 'end';
    node: React.ReactNode;
  };
  round?: boolean;
  size?: 'small' | 'medium' |'big';
  underline?: boolean;
  borderColor?: 'white' | 'black';
  type?: Type;
  onClick: (_payload?: any) => any;
}

export interface DescriptionAndImageButton extends ButtonInterface {
  position: 'start' | 'center' | 'end';
}