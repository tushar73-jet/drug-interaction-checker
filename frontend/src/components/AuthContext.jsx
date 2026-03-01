import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('doctor_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Sync with localStorage if needed, but the lazy initializer handles the reload case
  }, []);

  const login = (name) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem('doctor_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('doctor_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
