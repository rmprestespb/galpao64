import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import Admin from "./pages/Admin.tsx";
import AdminPreVendas from "./pages/AdminPreVendas.tsx";
import Aura from "./pages/Aura.tsx";
import Album from "./pages/Album.tsx";
import Receipts from "./pages/Receipts.tsx";
import Diecast from "./pages/Diecast.tsx";
import Showroom from "./pages/Showroom.tsx";
import MysteryBox from "./pages/MysteryBox.tsx";
import PreVendas from "./pages/PreVendas.tsx";
import PreVendasMarca from "./pages/PreVendasMarca.tsx";
import Empresa from "./pages/Empresa.tsx";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade.tsx";
import TermosUso from "./pages/TermosUso.tsx";
import TermosCompra from "./pages/TermosCompra.tsx";
import SplashScreen from "./components/SplashScreen.tsx";

const queryClient = new QueryClient();

const App = () => {
  // Sempre começa mostrando o splash: cada carregamento novo da página (digitar
  // o endereço, dar F5, abrir um link direto) é uma "chegada" na garagem, então
  // ele deve aparecer de novo — só fica escondido durante a navegação interna do
  // site (SPA), porque o App não remonta nesse caso. Antes isso ficava salvo no
  // navegador (sessionStorage) e só aparecia uma vez por aba, o que confundia
  // quem testava digitando o site de novo na mesma aba esperando ver o splash.
  const [splashDone, setSplashDone] = useState(false);

  const handleEnter = () => {
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
            {/* "/" entra direto em Pré-vendas (pedido do Robson). A home antiga
                (Garagem/Sobre, Index.tsx) continua existindo no repo, só não
                está mais roteada — pra voltar, é só trocar essa linha de volta
                por <Route path="/" element={<Index />} /> e reimportar Index. */}
            <Route path="/" element={<Navigate to="/pre-vendas" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/pre-vendas" element={<AdminPreVendas />} />
            <Route path="/admin/recibos" element={<Receipts />} />
            <Route path="/aura" element={<Aura />} />
            <Route path="/album" element={<Album />} />
            <Route path="/diecast" element={<Diecast />} />
            <Route path="/showroom" element={<Showroom />} />
            <Route path="/mystery-box" element={<MysteryBox />} />
            <Route path="/pre-vendas" element={<PreVendas />} />
            <Route path="/pre-vendas/:marca" element={<PreVendasMarca />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosUso />} />
            <Route path="/termos-de-compra" element={<TermosCompra />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
