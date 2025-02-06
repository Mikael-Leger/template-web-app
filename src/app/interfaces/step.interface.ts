import React from 'react';

export interface Step {
  number: number;
  title: string;
  node: React.ReactNode;
}