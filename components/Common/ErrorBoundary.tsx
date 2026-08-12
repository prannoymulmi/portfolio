'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
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
    const section = this.props.section ?? 'root';
    console.error(`[ErrorBoundary:${section}]`, error.message, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const message = this.state.error?.message ?? 'An unexpected error occurred.';
    const isContentError = /json|schema|validation|fetch/i.test(message);

    return (
      <div
        role="alert"
        className="flex min-h-[40vh] items-center justify-center bg-white px-4 py-12 dark:bg-gray-900"
      >
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {isContentError ? 'Content unavailable' : 'Something went wrong'}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {isContentError
              ? 'We could not load this section. Please try again in a moment.'
              : message}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
