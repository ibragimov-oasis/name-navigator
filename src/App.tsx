import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FavoritesProvider } from "@/lib/favorites";
import { PeopleProvider } from "@/lib/people";
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
import NameTafsir from "./pages/NameTafsir";
import ProphetsGuide from "./pages/ProphetsGuide";
import DuaCollection from "./pages/DuaCollection";
import NamingGuide from "./pages/NamingGuide";
import NameCompare from "./pages/NameCompare";
import NameStats from "./pages/NameStats";
import NameAnalytics from "./pages/NameAnalytics";
import People from "./pages/People";
import AdultNames from "./pages/people/AdultNames";
import RevertName from "./pages/people/RevertName";
import CharacterName from "./pages/people/CharacterName";
import Pseudonym from "./pages/people/Pseudonym";
import HistoricalFigures from "./pages/people/HistoricalFigures";
import Profiles from "./pages/people/Profiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FavoritesProvider>
        <PeopleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/children" element={<ChildrenNames />} />
            <Route path="/people" element={<People />} />
            <Route path="/people/profiles" element={<Profiles />} />
            <Route path="/people/adult" element={<AdultNames />} />
            <Route path="/people/revert" element={<RevertName />} />
            <Route path="/people/character" element={<CharacterName />} />
            <Route path="/people/pseudonym" element={<Pseudonym />} />
            <Route path="/people/historical" element={<HistoricalFigures />} />
            <Route path="/pets" element={<PetNames />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/wizard" element={<NameWizard />} />
            <Route path="/battle" element={<NameBattle />} />
            <Route path="/calendar" element={<NameCalendar />} />
            <Route path="/signature" element={<NameSignature />} />
            <Route path="/numerology" element={<NameNumerology />} />
            <Route path="/dna" element={<NameDNA />} />
            <Route path="/tafsir" element={<NameTafsir />} />
            <Route path="/prophets" element={<ProphetsGuide />} />
            <Route path="/dua" element={<DuaCollection />} />
            <Route path="/naming-guide" element={<NamingGuide />} />
            <Route path="/compare" element={<NameCompare />} />
            <Route path="/stats" element={<NameStats />} />
            <Route path="/import" element={<ImportData />} />
            <Route path="/analytics" element={<NameAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </PeopleProvider>
      </FavoritesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
