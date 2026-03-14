import { Component, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Oops, there was an unexpected error.</h2>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.href = "/"}
            style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
