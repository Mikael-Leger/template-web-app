import React from 'react';

export interface ButtonInterface {
  title: string;
  icon?: {
    orientation: 'start' | 'end';
    node: React.ReactNode
  };
  size?: 'small' | 'medium' |'big';
  underline?: boolean;
  borderColor?: 'white' | 'black';
  type?: 'primary' | 'white' | 'black' | 'info' | 'success' | 'warn' | 'error';
  onClick: (_payload?: any) => any;
}

export interface DescriptionAndImageButton extends ButtonInterface {
  position: 'start' | 'center' | 'end';
}