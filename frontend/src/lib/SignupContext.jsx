import React, { createContext, useContext, useState } from 'react';

const SignupContext = createContext(null);

export function SignupProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openSignup = () => setOpen(true);
  const closeSignup = () => setOpen(false);
  return (
    <SignupContext.Provider value={{ open, openSignup, closeSignup }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error('useSignup must be used within SignupProvider');
  return ctx;
}
