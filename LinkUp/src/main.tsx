
/**
 * LinkUp Application Entry Point
 * 
 * This is the entry point of the LinkUp application.
 * It renders the root App component into the DOM.
 */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a root and render the App component into it
createRoot(document.getElementById("root")!).render(<App />);
