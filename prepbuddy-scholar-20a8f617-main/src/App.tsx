import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/AppLayout";
import PDFNotes from "@/pages/PDFNotes";
import ImageNotes from "@/pages/ImageNotes";
import AudioNotes from "@/pages/AudioNotes";
import YTNotes from "@/pages/YTNotes";
import TextNotes from "@/pages/TextNotes";
import CareerAdvisor from "@/pages/CareerAdvisor";
import JobSearch from "@/pages/JobSearch";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/pdf-notes" replace />} />
            <Route path="pdf-notes" element={<PDFNotes />} />
            <Route path="image-notes" element={<ImageNotes />} />
            <Route path="audio-notes" element={<AudioNotes />} />
            <Route path="yt-notes" element={<YTNotes />} />
            <Route path="text-notes" element={<TextNotes />} />
            <Route path="career" element={<CareerAdvisor />} />
            <Route path="job-search" element={<JobSearch />} />
            <Route path="*" element={
              <div className="flex-1 flex items-center justify-center">
                <p className="font-serif text-2xl text-muted-foreground">Page not found</p>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
