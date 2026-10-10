import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { CreditsProvider } from "./context/CreditsContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ThemeProvider>
      <RoleProvider>
        <CreditsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CreditsProvider>
      </RoleProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
