// App.jsx
import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout.jsx";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute.jsx";

import Index from "./pages/Index.jsx";
import Profile from "./pages/Profile.jsx";
import RoleExplorer from "./pages/RoleExplorer.jsx";
import LearningHub from "./pages/LearningHub.jsx";
import PracticeHub from "./pages/PracticeHub.jsx";
import Counseling from "./pages/Counseling.jsx";
import MyDrives from "./pages/MyDrives.jsx";
import Calendar from "./pages/Calendar.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/roles" element={<RoleExplorer />} />
                <Route path="/learning" element={<LearningHub />} />
                <Route path="/practice" element={<PracticeHub />} />
                <Route path="/counseling" element={<Counseling />} />
                <Route path="/drives" element={<MyDrives />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;