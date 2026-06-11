import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import "@/index.css";
import App from "@/App";
import { LangProvider } from "@/lib/LangContext";
import { SignupProvider } from "@/lib/SignupContext";
import { AdminAuthProvider } from "@/lib/AdminAuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LangProvider>
            <SignupProvider>
              <AdminAuthProvider>
                <App />
              </AdminAuthProvider>
            </SignupProvider>
          </LangProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
