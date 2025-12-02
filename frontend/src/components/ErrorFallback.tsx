'use client';

/**
 * Client component for error fallback UI
 * Must be a client component to use event handlers
 */
export function ErrorFallback() {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>Something went wrong</h1>
      <p>Please refresh the page or contact support if the problem persists.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}
      >
        Reload Page
      </button>
    </div>
  );
}

