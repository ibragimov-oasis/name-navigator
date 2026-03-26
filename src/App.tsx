import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "@/lib/favorites";
import Index from "./pages/Index";
import ChildrenNames from "./pages/ChildrenNames";
import PetNames from "./pages/PetNames";
import Favorites from "./pages/Favorites";
import ImportData from "./pages/ImportData";
import NameWizard from "./pages/NameWizard";
import NameBattle from "./pages/NameBattle";
import NameCalendar from "./pages/NameCalendar";
import NameSignature from "./pages/NameSignature";
import NameNumerology from "./pages/NameNumerology";
import NameDNA from "./pages/NameDNA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/children" element={<ChildrenNames />} />
            <Route path="/pets" element={<PetNames />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/wizard" element={<NameWizard />} />
            <Route path="/battle" element={<NameBattle />} />
            <Route path="/calendar" element={<NameCalendar />} />
            <Route path="/signature" element={<NameSignature />} />
            <Route path="/numerology" element={<NameNumerology />} />
            <Route path="/dna" element={<NameDNA />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
