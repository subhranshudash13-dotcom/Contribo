'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Temporary System Glitch | Contribo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #0d0f12;
              color: #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .container {
              max-width: 500px;
              padding: 2.5rem 1.5rem;
              margin: auto;
            }
            .badge {
              display: inline-block;
              font-size: 11px;
              font-family: ui-monospace, monospace;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              color: #f59e0b;
              background: rgba(245, 158, 11, 0.1);
              border: 1px solid rgba(245, 158, 11, 0.25);
              padding: 4px 10px;
              border-radius: 9999px;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 1.75rem;
              font-weight: 800;
              margin: 0 0 0.75rem 0;
              letter-spacing: -0.02em;
            }
            p {
              font-size: 0.95rem;
              color: #9ca3af;
              line-height: 1.6;
              margin: 0 0 2rem 0;
            }
            .btn-group {
              display: flex;
              gap: 0.75rem;
              justify-content: center;
              flex-wrap: wrap;
            }
            button, a {
              padding: 0.65rem 1.4rem;
              font-size: 0.875rem;
              font-weight: 600;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: opacity 0.2s;
              text-decoration: none;
            }
            .btn-primary {
              background-color: #f59e0b;
              color: #0d0f12;
              border: none;
            }
            .btn-primary:hover {
              opacity: 0.9;
            }
            .btn-secondary {
              background: rgba(255, 255, 255, 0.05);
              color: #e5e7eb;
              border: 1px solid rgba(255, 255, 255, 0.12);
            }
            .btn-secondary:hover {
              background: rgba(255, 255, 255, 0.1);
            }
          `
        }} />
      </head>
      <body>
        <div className="container">
          <div className="badge">Platform Recovery</div>
          <h1>System Encountered a Hiccup</h1>
          <p>
            An unexpected error occurred while processing your request. The system has automatically isolated the issue to maintain platform stability.
          </p>
          <div className="btn-group">
            <button
              type="button"
              className="btn-primary"
              onClick={() => reset()}
            >
              Recover Session
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
