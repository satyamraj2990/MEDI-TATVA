import { createRoot } from "react-dom/client";

// Minimal test to see if React loads at all
const TestApp = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0f172a',
      color: '#fff',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>✅ React is Working!</h1>
        <p>If you see this, React mounted successfully.</p>
        <p style={{marginTop: '1rem', color: '#94a3b8'}}>
          The issue is in the App component or its dependencies.
        </p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = ''; // Clear loading screen
  createRoot(rootElement).render(<TestApp />);
} else {
  console.error("Root element not found");
}
