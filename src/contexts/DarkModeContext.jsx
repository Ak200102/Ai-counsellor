import { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true); // Start with true for testing

  useEffect(() => {
    console.log('DarkMode effect running, darkMode:', darkMode);
    // Update document class for Tailwind dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#1f2937";
      document.body.style.color = "#f9fafb";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#1f2937";
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    console.log('Toggle called, switching from', darkMode, 'to', !darkMode);
    setDarkMode(!darkMode);
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
