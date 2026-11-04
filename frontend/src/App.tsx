
import { useEffect, useState } from "react";
import "./App.css";

interface HealthResponse {
  status: string;
  application: string;
  backend: string;
}

function App() {
  const [backendStatus, setBackendStatus] =
    useState("Checking connection...");

  const [health, setHealth] =
    useState<HealthResponse | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/health"
        );

        if (!response.ok) {
          throw new Error("Backend connection failed");
        }

        const data: HealthResponse = await response.json();

        setHealth(data);
        setBackendStatus("Connected");
      } catch {
        setHealth(null);
        setBackendStatus("Disconnected");
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="app">
      <div className="content">
        <div className="brand">
          <span className="brand-icon">N</span>
          <span>NORTHSTAR UNIVERSITY</span>
        </div>

        <div className="welcome">
          <span className="eyebrow">
            VIRTUAL INFORMATION CENTRE
          </span>

          <h1>Welcome to Northstar University</h1>

          <p>
            Your virtual information assistant is here
            to help you explore our university, programmes,
            admissions and student services.
          </p>

          <div className="connection">
            <span
              className={
                backendStatus === "Connected"
                  ? "status-dot online"
                  : "status-dot offline"
              }
            />

            Backend: {backendStatus}
          </div>

          {health && (
            <p className="backend-info">
              {health.application} · {health.backend}
            </p>
          )}

          <button className="start-button" disabled>
            Start Conversation
          </button>

          <p className="setup-note">
            Your virtual assistant will be available soon.
          </p>
        </div>

        <footer>
          AI-Powered Virtual Information Centre
        </footer>
      </div>
    </main>
  );
}

export default App;
