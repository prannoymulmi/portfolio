'use client';

import React, { ReactNode } from 'react';
import { useUi } from '@/components/Common/LocaleProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorFallbackProps {
  /** The caught error's own message, or `null` for an error with none —
   * `ui.errors.unexpectedError` fills that gap here rather than in the class
   * component, which has no dictionary access of its own. */
  message: string | null;
  onRetry: () => void;
}

/**
 * The fallback markup, split out from the class component so it can call
 * hooks (`useUi()`, ADR 0024). The class above keeps only error state and
 * delegates rendering here.
 */
function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  const ui = useUi();
  const resolvedMessage = message ?? ui.errors.unexpectedError;
  const isContentError = message !== null && /json|schema|validation|fetch/i.test(message);

  return (
    <div
      role="alert"
      className="flex min-h-[40vh] items-center justify-center bg-background px-4 py-12 dark:bg-gray-900"
    >
      <div className="max-w-md text-center">
        <h2 className="font-display mb-2 text-2xl font-bold text-foreground dark:text-white">
          {isContentError ? ui.errors.contentUnavailable : ui.errors.somethingWentWrong}
        </h2>
        <p className="mb-6 text-muted-foreground dark:text-gray-300">
          {isContentError ? ui.errors.couldNotLoadSection : resolvedMessage}
        </p>
        <button
          type="button"
          onClick={onRetry}
          // Text on the primary fill uses `foreground`, not `primary-foreground`
          // (research R1 — primary-foreground measures 3.26:1 against primary).
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {ui.errors.tryAgain}
        </button>
      </div>
    </div>
  );
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

    return <ErrorFallback message={this.state.error?.message ?? null} onRetry={this.handleRetry} />;
  }
}
