import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

// Without this, any uncaught error while the app first loads results in a
// silent blank white page — the real reason only ever shows up in a browser
// devtools console, which isn't reachable from iPhone Safari without a Mac.
// This catches it and prints the actual message directly on the page.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('NextStep Africa crashed while rendering:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            padding: '24px',
            background: '#ffffff',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ color: '#F57C00', fontSize: '18px', margin: 0 }}>
            NextStep Africa hit an error while loading
          </h1>
          <p style={{ fontSize: '13px', marginTop: '12px', color: '#0D47A1' }}>
            This is the exact error, so it's fixable directly:
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              marginTop: '8px',
              border: '1px solid #eee',
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ fontSize: '12px', marginTop: '16px', color: '#666' }}>
            Most common cause: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is
            missing, mistyped, or still wrapped in quote marks in Cloudflare
            Pages → Settings → Environment variables.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
