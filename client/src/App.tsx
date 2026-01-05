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
import Discussion from "./pages/Discussion";
import Feed from "./pages/Feed";
import AdminPortal from "./pages/AdminPortal";
import ProfileView from "./pages/ProfileView";
import BatchReunion from "./pages/BatchReunion";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/auth"} component={Auth} />
      <Route path={"/verify-email"} component={Auth} />
      <Route path={"/reset-password"} component={Auth} />

      {/* Protected Routes */}
      <Route path="/profile-setup">
        <ProtectedRoute component={ProfileSetup} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/directory">
        <ProtectedRoute component={Directory} />
      </Route>
      <Route path="/profile/:id">
        <ProtectedRoute component={ProfileView} />
      </Route>
      <Route path="/jobs">
        <ProtectedRoute component={Jobs} />
      </Route>
      <Route path="/events">
        <ProtectedRoute component={Events} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={Messages} />
      </Route>
      <Route path="/mentorship">
        <ProtectedRoute component={Mentorship} />
      </Route>
      <Route path="/discussion">
        <ProtectedRoute component={Discussion} />
      </Route>
      <Route path="/feed">
        <ProtectedRoute component={Feed} />
      </Route>
      <Route path="/batch-reunion">
        <ProtectedRoute component={BatchReunion} />
      </Route>

      {/* Admin Only Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminPortal} adminOnly />
      </Route>

      {/* Fallback Routes */}
      <Route path={"/404"} component={NotFound} />
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
