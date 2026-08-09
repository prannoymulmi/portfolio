'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gray-900">
            <div className="max-w-md text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Section Not Available
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                {this.state.error?.message || 'An error occurred loading this section.'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
