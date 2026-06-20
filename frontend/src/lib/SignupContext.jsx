import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupContext = createContext(null);

export function SignupProvider({ children }) {
  // Kept for backwards compatibility with the legacy lead-capture modal.
  // We no longer open it by default — the primary "Register" CTAs now go
  // straight to the customer cabinet's real registration wizard.
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const openSignup = useCallback(() => {
    navigate('/cabinet/register');
  }, [navigate]);

  const closeSignup = useCallback(() => setOpen(false), []);

  // Escape hatch in case the old lead-capture modal is ever needed again.
  const openLeadModal = useCallback(() => setOpen(true), []);

  return (
    <SignupContext.Provider value={{ open, openSignup, closeSignup, openLeadModal }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error('useSignup must be used within SignupProvider');
  return ctx;
}
