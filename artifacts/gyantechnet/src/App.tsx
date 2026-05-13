import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import IntroScreen from "@/components/IntroScreen";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ChatPage from "@/pages/ChatPage";
import ImageAIPage from "@/pages/ImageAIPage";
import VideoAIPage from "@/pages/VideoAIPage";
import VideoCallPage from "@/pages/VideoCallPage";
import MusicAIPage from "@/pages/MusicAIPage";
import TTSPage from "@/pages/TTSPage";
import FilesPage from "@/pages/FilesPage";
import MemoryPage from "@/pages/MemoryPage";
import DocsPage from "@/pages/DocsPage";
import DrawPage from "@/pages/DrawPage";
import VideoEditorPage from "@/pages/VideoEditorPage";
import WorkspacesPage from "@/pages/WorkspacesPage";
import BusinessPage from "@/pages/BusinessPage";
import EmailPage from "@/pages/EmailPage";
import ConversationPage from "@/pages/ConversationPage";
import GamesPage from "@/pages/GamesPage";
import NotesPage from "@/pages/NotesPage";
import CalendarPage from "@/pages/CalendarPage";
import TasksPage from "@/pages/TasksPage";
import FocusTimerPage from "@/pages/FocusTimerPage";
import ProjectsPage from "@/pages/ProjectsPage";
import FormsPage from "@/pages/FormsPage";
import SlidesPage from "@/pages/SlidesPage";
import SheetsPage from "@/pages/SheetsPage";
import WhiteboardPage from "@/pages/WhiteboardPage";
import CalculatorPage from "@/pages/CalculatorPage";
import QRGeneratorPage from "@/pages/QRGeneratorPage";
import TranslatorPage from "@/pages/TranslatorPage";
import WeatherPage from "@/pages/WeatherPage";
import FileConverterPage from "@/pages/FileConverterPage";
import PasswordsPage from "@/pages/PasswordsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import WikiPage from "@/pages/WikiPage";
import ResearchPage from "@/pages/ResearchPage";
import LearnPage from "@/pages/LearnPage";
import StoriesPage from "@/pages/StoriesPage";
import MeetPage from "@/pages/MeetPage";
import CRMPage from "@/pages/CRMPage";
import InvoicesPage from "@/pages/InvoicesPage";
import MusicPlayerPage from "@/pages/MusicPlayerPage";
import APITesterPage from "@/pages/APITesterPage";
import DBManagerPage from "@/pages/DBManagerPage";
import CricketPage from "@/pages/CricketPage";
import APIKeysPage from "@/pages/APIKeysPage";
import SettingsPage from "@/pages/SettingsPage";
import IntelligencePage from "@/pages/IntelligencePage";
import DevConsolePage from "@/pages/DevConsolePage";
import GyanVersePage from "@/pages/GyanVersePage";
import MultiChatPage from "@/pages/MultiChatPage";
import WorkflowsPage from "@/pages/WorkflowsPage";
import CommandCenterPage from "@/pages/CommandCenterPage";
import AdminPage from "@/pages/AdminPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function DeveloperRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isDeveloper } = useAuth();
  if (!user) return <Redirect to="/login" />;
  if (!isDeveloper) return <Redirect to="/chat" />;
  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  if (user) return <Redirect to="/command-center" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => { const { user } = useAuth(); return user ? <Redirect to="/command-center" /> : <LandingPage />; }} />
      <Route path="/login" component={() => <PublicRoute component={LoginPage} />} />
      <Route path="/register" component={() => <PublicRoute component={RegisterPage} />} />
      {/* AI Tools */}
      <Route path="/chat" component={() => <ProtectedRoute component={ChatPage} />} />
      <Route path="/multi-chat" component={() => <ProtectedRoute component={MultiChatPage} />} />
      <Route path="/workflows" component={() => <ProtectedRoute component={WorkflowsPage} />} />
      <Route path="/command-center" component={() => <ProtectedRoute component={CommandCenterPage} />} />
      <Route path="/image-ai" component={() => <ProtectedRoute component={ImageAIPage} />} />
      <Route path="/video-ai" component={() => <ProtectedRoute component={VideoAIPage} />} />
      <Route path="/video-call" component={() => <ProtectedRoute component={VideoCallPage} />} />
      <Route path="/music-ai" component={() => <ProtectedRoute component={MusicAIPage} />} />
      <Route path="/tts" component={() => <ProtectedRoute component={TTSPage} />} />
      <Route path="/files" component={() => <ProtectedRoute component={FilesPage} />} />
      <Route path="/memory" component={() => <ProtectedRoute component={MemoryPage} />} />
      <Route path="/docs" component={() => <ProtectedRoute component={DocsPage} />} />
      <Route path="/draw" component={() => <ProtectedRoute component={DrawPage} />} />
      <Route path="/video-editor" component={() => <ProtectedRoute component={VideoEditorPage} />} />
      <Route path="/workspaces" component={() => <ProtectedRoute component={WorkspacesPage} />} />
      <Route path="/business" component={() => <ProtectedRoute component={BusinessPage} />} />
      <Route path="/email" component={() => <ProtectedRoute component={EmailPage} />} />
      <Route path="/conversation" component={() => <ProtectedRoute component={ConversationPage} />} />
      <Route path="/games" component={() => <ProtectedRoute component={GamesPage} />} />
      {/* Workspace */}
      <Route path="/notes" component={() => <ProtectedRoute component={NotesPage} />} />
      <Route path="/calendar" component={() => <ProtectedRoute component={CalendarPage} />} />
      <Route path="/tasks" component={() => <ProtectedRoute component={TasksPage} />} />
      <Route path="/focus" component={() => <ProtectedRoute component={FocusTimerPage} />} />
      <Route path="/projects" component={() => <ProtectedRoute component={ProjectsPage} />} />
      <Route path="/forms" component={() => <ProtectedRoute component={FormsPage} />} />
      <Route path="/slides" component={() => <ProtectedRoute component={SlidesPage} />} />
      <Route path="/sheets" component={() => <ProtectedRoute component={SheetsPage} />} />
      <Route path="/whiteboard" component={() => <ProtectedRoute component={WhiteboardPage} />} />
      {/* Tools */}
      <Route path="/calculator" component={() => <ProtectedRoute component={CalculatorPage} />} />
      <Route path="/qr-generator" component={() => <ProtectedRoute component={QRGeneratorPage} />} />
      <Route path="/translator" component={() => <ProtectedRoute component={TranslatorPage} />} />
      <Route path="/weather" component={() => <ProtectedRoute component={WeatherPage} />} />
      <Route path="/converter" component={() => <ProtectedRoute component={FileConverterPage} />} />
      <Route path="/passwords" component={() => <ProtectedRoute component={PasswordsPage} />} />
      {/* Pro */}
      <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
      <Route path="/wiki" component={() => <ProtectedRoute component={WikiPage} />} />
      <Route path="/research" component={() => <ProtectedRoute component={ResearchPage} />} />
      <Route path="/learn" component={() => <ProtectedRoute component={LearnPage} />} />
      <Route path="/stories" component={() => <ProtectedRoute component={StoriesPage} />} />
      <Route path="/meet" component={() => <ProtectedRoute component={MeetPage} />} />
      <Route path="/crm" component={() => <ProtectedRoute component={CRMPage} />} />
      <Route path="/invoices" component={() => <ProtectedRoute component={InvoicesPage} />} />
      <Route path="/music-player" component={() => <ProtectedRoute component={MusicPlayerPage} />} />
      <Route path="/cricket" component={() => <ProtectedRoute component={CricketPage} />} />
      {/* Developer */}
      <Route path="/api-tester" component={() => <ProtectedRoute component={APITesterPage} />} />
      <Route path="/db-manager" component={() => <ProtectedRoute component={DBManagerPage} />} />
      <Route path="/api-keys" component={() => <ProtectedRoute component={APIKeysPage} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path="/intelligence" component={() => <ProtectedRoute component={IntelligencePage} />} />
      <Route path="/subscription" component={() => <ProtectedRoute component={SubscriptionPage} />} />
      <Route path="/dev-console" component={() => <DeveloperRoute component={DevConsolePage} />} />
      <Route path="/admin" component={() => <DeveloperRoute component={AdminPage} />} />
      <Route path="/gyanverse/:id" component={() => <ProtectedRoute component={GyanVersePage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [introDone, setIntroDone] = useState(() => {
    const done = sessionStorage.getItem("gyan_intro_done");
    return done === "1";
  });

  const handleIntroDone = () => {
    sessionStorage.setItem("gyan_intro_done", "1");
    setIntroDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <NotificationProvider>
            {!introDone && <IntroScreen onDone={handleIntroDone} />}
            <div style={{ visibility: introDone ? "visible" : "hidden", opacity: introDone ? 1 : 0, transition: "opacity 0.4s ease" }}>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
