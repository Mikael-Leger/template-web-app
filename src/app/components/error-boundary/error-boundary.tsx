'use client';

import React, { Component, ReactNode } from 'react';

import './error-boundary.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='error-boundary w-full h-full flex flex-col justify-center items-center'>
          <div className='error-boundary-content flex flex-col items-center gap-4'>
            <div className='error-boundary-icon'>
              <svg width='64' height='64' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/>
                <line x1='12' y1='8' x2='12' y2='12' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/>
                <circle cx='12' cy='16' r='1' fill='currentColor'/>
              </svg>
            </div>
            <h2 className='error-boundary-title'>Something went wrong</h2>
            <p className='error-boundary-message'>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className='error-boundary-button'
              onClick={this.handleRetry}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
