import { Suspense, lazy, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import PreVendas from "./pages/PreVendas.tsx";
import PreVendasMarca from "./pages/PreVendasMarca.tsx";
import SplashScreen from "./components/SplashScreen.tsx";
// Páginas fora do caminho principal (admin, álbum, institucionais etc.) são
// carregadas só quando a pessoa entra nelas, pra a primeira visita ficar mais leve.
// PreVendas/PreVendasMarca (o fluxo principal) e NotFound continuam carregadas direto.
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminPreVendas = lazy(() => import("./pages/AdminPreVendas.tsx"));
const AdminPedidos = lazy(() => import("./pages/AdminPedidos.tsx"));
const AdminGaleria = lazy(() => import("./pages/AdminGaleria.tsx"));
const AdminBanners = lazy(() => import("./pages/AdminBanners.tsx"));
const NoGalpao = lazy(() => import("./pages/NoGalpao.tsx"));
const Aura = lazy(() => import("./pages/Aura.tsx"));
const Album = lazy(() => import("./pages/Album.tsx"));
const Receipts = lazy(() => import("./pages/Receipts.tsx"));
const Diecast = lazy(() => import("./pages/Diecast.tsx"));
const Showroom = lazy(() => import("./pages/Showroom.tsx"));
const MysteryBox = lazy(() => import("./pages/MysteryBox.tsx"));
const Empresa = lazy(() => import("./pages/Empresa.tsx"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade.tsx"));
const TermosUso = lazy(() => import("./pages/TermosUso.tsx"));
const TermosCompra = lazy(() => import("./pages/TermosCompra.tsx"));

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
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }
          >
          <Routes>
            {/* "/" entra direto em Pré-vendas (pedido do Robson). A home antiga
                (Garagem/Sobre, Index.tsx) continua existindo no repo, só não
                está mais roteada — pra voltar, é só trocar essa linha de volta
                por <Route path="/" element={<Index />} /> e reimportar Index. */}
            <Route path="/" element={<Navigate to="/pre-vendas" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/redefinir-senha" element={<AdminResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/pre-vendas" element={<AdminPreVendas />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
            <Route path="/admin/pedidos" element={<AdminPedidos />} />
            <Route path="/admin/no-galpao" element={<AdminGaleria />} />
            <Route path="/admin/recibos" element={<Receipts />} />
            <Route path="/aura" element={<Aura />} />
            <Route path="/album" element={<Album />} />
            <Route path="/diecast" element={<Diecast />} />
            <Route path="/showroom" element={<Showroom />} />
            <Route path="/mystery-box" element={<MysteryBox />} />
            <Route path="/pre-vendas" element={<PreVendas />} />
            <Route path="/pre-vendas/:marca" element={<PreVendasMarca />} />
            <Route path="/no-galpao" element={<NoGalpao />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosUso />} />
            <Route path="/termos-de-compra" element={<TermosCompra />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
