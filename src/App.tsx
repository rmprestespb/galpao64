import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Admin from "./pages/Admin.tsx";
import Aura from "./pages/Aura.tsx";
import Album from "./pages/Album.tsx";
import Receipts from "./pages/Receipts.tsx";
import Diecast from "./pages/Diecast.tsx";
import SplashScreen from "./components/SplashScreen.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [splashDone, setSplashDone] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("g64_splash") === "1",
  );

  const handleEnter = () => {
    sessionStorage.setItem("g64_splash", "1");
    setSplashDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!splashDone && <SplashScreen onEnter={handleEnter} />}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/recibos" element={<Receipts />} />
            <Route path="/aura" element={<Aura />} />
            <Route path="/album" element={<Album />} />
            <Route path="/diecast" element={<Diecast />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
