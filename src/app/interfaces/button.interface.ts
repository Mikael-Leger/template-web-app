import React from 'react';

import { Type } from '../types/type';

export interface ButtonInterface {
  title?: string | number;
  icon?: {
    orientation?: 'start' | 'end';
    node: React.ReactNode;
  };
  round?: boolean;
  size?: 'small' | 'medium' |'big';
  underline?: boolean;
  borderColor?: 'white' | 'black';
  backgroundColor?: 'primary' | 'secondary' | 'white';
  width?: string | number;
  fullHeight?: boolean;
  fullWidth?: boolean;
  type?: Type;
  padding?: boolean;
  input?: 'number' | undefined;
  maxChars?: number;
  disabled?: boolean;
  buttonType?: 'submit';
  outline?: boolean;
  className?: string;
  onClick?: (_payload?: any) => any;
  onChange?: (_payload?: any) => any;
}

export interface DescriptionAndImageButton extends ButtonInterface {
  position: 'start' | 'center' | 'end';
}