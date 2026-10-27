"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 my-4">
          <div className="text-center max-w-md space-y-4 animate-fade-in">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AppIcon name="solar:danger-triangle-bold-duotone" className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {this.props.title || 'Terjadi Masalah pada Komponen Ini'}
              </h3>
              <p className="text-sm text-slate-500">
                {this.props.description || 'Komponen tidak dapat dimuat sementara. Anda dapat mencoba memuat ulang.'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-lg text-left overflow-auto max-h-32 border border-red-100">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="gap-2 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-100"
              >
                <AppIcon name="solar:restart-linear" className="w-4 h-4" />
                Coba Lagi
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                <AppIcon name="solar:home-smile-bold-duotone" className="w-4 h-4" />
                Beranda
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
