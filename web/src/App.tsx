import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Checkout from "./pages/Checkout";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceView from "./pages/InvoiceView";
import Dashboard from "./pages/Dashboard";
import Yield from "./pages/Yield";
import Security from "./pages/Security";
import Docs from "./pages/Docs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StealthScanner from "./pages/StealthScanner";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: 'hsl(263, 70%, 58%)',
          accentColorForeground: 'white',
          borderRadius: 'medium',
          fontStack: 'system',
        })}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/invoices/new" element={<CreateInvoice />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/invoice/:id" element={<InvoiceView />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/stealth" element={<StealthScanner />} />
              <Route path="/yield" element={<Yield />} />
              <Route path="/security" element={<Security />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
