import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const logout = async () => {
    await signOut();
  };

  const login = () => {
    console.warn("Manual login called. Clerk handles authentication via SignIn component.");
  };

  const formattedUser = user ? {
    ...user,
    name: user.fullName || user.firstName || user.username || 'Doctor'
  } : null;

  return (
    <AuthContext.Provider value={{ 
      user: formattedUser, 
      login, 
      logout,
      isLoaded,
      isSignedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
