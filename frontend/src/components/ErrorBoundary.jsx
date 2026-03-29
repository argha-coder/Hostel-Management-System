import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#F9FAFB',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#111827', marginBottom: '10px' }}>Something went wrong.</h1>
          <p style={{ color: '#4B5563', marginBottom: '20px' }}>The application encountered an unexpected error.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ 
              marginTop: '20px', 
              padding: '20px', 
              background: '#FEE2E2', 
              color: '#991B1B', 
              borderRadius: '8px',
              maxWidth: '80%',
              overflow: 'auto',
              fontSize: '0.8rem'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
