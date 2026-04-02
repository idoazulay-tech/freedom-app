import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

import Dashboard from './pages/Dashboard';
import TriageWizard from './pages/TriageWizard';
import ProfessionalDiagnosis from './pages/ProfessionalDiagnosis';
import DiagnosisResults from './pages/DiagnosisResults';
import Diagnosis from './pages/Diagnosis';
import Profile from './pages/Profile';
import Letters from './pages/Letters';
import Calculator from './pages/Calculator';
import DebtTracker from './pages/DebtTracker';
import DocumentScanner from './pages/DocumentScanner';
import Lawyers from './pages/Lawyers';

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/triage"} component={TriageWizard} />
       <Route path="/diagnosis-professional" component={ProfessionalDiagnosis} />
      <Route path="/diagnosis-results" component={DiagnosisResults} />
      <Route path={"/diagnosis"} component={Diagnosis} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/letters"} component={Letters} />
      <Route path={"/calculator"} component={Calculator} />
      <Route path={"/tracker"} component={DebtTracker} />
      <Route path={"/scanner"} component={DocumentScanner} />
      <Route path={"/lawyers"} component={Lawyers} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
