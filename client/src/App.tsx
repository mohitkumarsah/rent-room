import React, { Suspense, lazy } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// =========================
// Lazy Loaded Pages
// =========================
const Home = lazy(() => import("./pages/Home"));
const MapView = lazy(() => import("./pages/MapView"));
const ListRoom = lazy(() => import("./pages/ListRoom"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RoomListings = lazy(() => import("./pages/RoomListings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// =========================
// Loading Screen
// =========================
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>

        <h2 className="text-xl font-semibold">
          Loading...
        </h2>

        <p className="text-muted-foreground">
          Please wait while the page loads
        </p>
      </div>
    </div>
  );
}

// =========================
// App Router
// =========================
function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>

        {/* Home */}
        <Route path="/" component={Home as any} />



        {/* Map */}
        <Route path={"/map"} component={MapView} />

        {/* Add Room */}
        <Route path={"/list-room"} component={ListRoom} />

        {/* Dashboard */}
        <Route path={"/dashboard"} component={Dashboard} />

        {/* Listings */}
        <Route path={"/listings"} component={RoomListings} />

        {/* 404 Page */}
        <Route path={"/404"} component={NotFound} />

        {/* Final Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// =========================
// Main App
// =========================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">

        <TooltipProvider>

          {/* Toast Notifications */}
          <Toaster richColors position="top-right" />

          {/* Application Routes */}
          <Router />

        </TooltipProvider>

      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;