import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";
import { LangProvider } from "@/lib/LangContext";
import { SignupProvider } from "@/lib/SignupContext";

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LangProvider>
          <SignupProvider>
            <App />
          </SignupProvider>
        </LangProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
