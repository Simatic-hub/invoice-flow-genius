
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    
    // Update state with error info for detailed display
    this.setState({
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-6 m-4 border border-red-500 bg-red-50 rounded-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
          </div>
          
          <p className="text-red-600 mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-red-500 font-medium">Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-[200px]">
              {this.state.error?.stack}
            </pre>
            {this.state.errorInfo && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-[200px]">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
