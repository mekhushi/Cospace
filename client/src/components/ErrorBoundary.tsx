import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-6 z-[9999]">
          <div className="bg-black border border-red-500/50 p-8 max-w-md w-full shadow-2xl">
            <h1 className="text-red-500 font-black text-xl mb-4 uppercase tracking-tighter">System Critical Error</h1>
            <p className="text-slate-400 text-sm mb-6 font-mono">
              The neural link has been severed. A component in the application crashed.
            </p>
            <div className="bg-red-500/10 p-4 rounded border border-red-500/20 mb-6">
              <code className="text-red-400 text-xs break-all">
                {this.state.error?.message}
              </code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-400 text-black font-black py-3 uppercase tracking-widest transition-colors"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
