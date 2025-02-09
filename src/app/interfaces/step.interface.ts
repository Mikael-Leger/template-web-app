import React from 'react';

export interface Step {
  number: number;
  title: string;
  node: () => React.ReactNode;
  error?: string;
}

export interface StepErrors {
  hasErrors: (_value: string) => void;
}