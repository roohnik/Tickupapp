import React, { Component, ErrorInfo, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isSocketConnected: boolean;
}

class SocketErrorBoundary extends Component<Props, State> {
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isSocketConnected: true
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Socket error caught:', error, errorInfo);
    
    // Check if it's a socket connection error
    if (error.message.includes('socket') || error.message.includes('connection')) {
      this.setState({ isSocketConnected: false });
      this.attemptReconnect();
    }
  }

  componentWillUnmount() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  attemptReconnect = () => {
    this.reconnectTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        isSocketConnected: true
      });
    }, 3000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded shadow-lg z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {!this.state.isSocketConnected ? 'اتصال قطع شد' : 'خطا در ارتباط'}
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>در حال تلاش برای اتصال مجدد...</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-600 dark:hover:text-yellow-100"
                >
                  رفرش دستی
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SocketErrorBoundary;
