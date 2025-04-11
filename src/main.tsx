
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { create } from 'zustand';

createRoot(document.getElementById("root")!).render(<App />);
