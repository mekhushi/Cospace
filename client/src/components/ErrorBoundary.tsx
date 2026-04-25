import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10 text-center">
          <h1 className="text-4xl font-black text-red-500 mb-4 uppercase tracking-tighter">System Failure</h1>
          <p className="text-slate-400 font-mono text-sm max-w-md mb-8">
            An unexpected error has occurred in the VirtualCosmos core.
          </p>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm mb-10 text-left w-full max-w-2xl overflow-auto">
            <code className="text-red-400 text-xs">
              {this.state.error?.toString()}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors"
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
