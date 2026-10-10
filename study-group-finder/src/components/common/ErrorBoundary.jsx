import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoLogin = () => {
    sessionStorage.clear();
    localStorage.removeItem('studyconnect_token');
    localStorage.removeItem('studyconnect_user');
    window.location.href = '/Auth';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-slate-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              StudyConnect App Notice
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {this.state.error?.message || "An unexpected rendering state occurred. Click below to refresh or return to login."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md shadow-orange-500/20"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoLogin}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-sm transition-all"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
