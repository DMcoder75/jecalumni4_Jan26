import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import Jobs from "./pages/Jobs";
import Events from "./pages/Events";
import Messages from "./pages/Messages";
import Mentorship from "./pages/Mentorship";
import Feed from "./pages/Feed";
import AdminPortal from "./pages/AdminPortal";
import ProfileView from "./pages/ProfileView";
import BatchReunion from "./pages/BatchReunion";
import Navigation from "./components/Navigation";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/auth"} component={Auth} />
      <Route path={"/verify-email"} component={Auth} />
      <Route path={"/reset-password"} component={Auth} />
      <Route path={"/profile-setup"} component={ProfileSetup} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/directory"} component={Directory} />
      <Route path={"/profile/:id"} component={ProfileView} />
      <Route path={"/jobs"} component={Jobs} />
      <Route path={"/events"} component={Events} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/mentorship"} component={Mentorship} />
      <Route path={"/feed"} component={Feed} />
      <Route path={"/admin"} component={AdminPortal} />
      <Route path={"/batch-reunion"} component={BatchReunion} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Navigation />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
