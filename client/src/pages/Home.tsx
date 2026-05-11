import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { MapPin, Home as HomeIcon, Users, Zap, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "sonner";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchCity, setSearchCity] = useState("");
  const { user, loading: authLoading, signInWithGoogle, logout } = useFirebaseAuth();

  const handleFindRooms = () => {
    if (searchCity.trim()) {
      setLocation(`/listings?city=${encodeURIComponent(searchCity)}`);
    } else {
      setLocation("/listings");
    }
  };

  const handleListRoom = () => {
    setLocation("/list-room");
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error("Failed to sign in");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-accent">RoomDekho</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/listings")}>
              Browse Rooms
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/map")}>
              <MapPin className="w-4 h-4 mr-1" />
              Nearby
            </Button>

            {authLoading ? null : user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </Button>
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">
                    {user.displayName?.split(" ")[0]}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setLocation("/list-room")}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Rent Room Chahiye?
              <br />
              <span className="text-accent">Abhi Milega.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Broker nahi. Commission nahi. Bas map kholo aur seedha owner ko call karo.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <div className="flex-1">
                <Input
                  placeholder="Search by city or area..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFindRooms();
                  }}
                />
              </div>
              <Button
                size="lg"
                className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                onClick={handleFindRooms}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find a Room
              </Button>
            </div>

            {/* Secondary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
                onClick={handleListRoom}
              >
                List Your Room
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setLocation("/map")}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Nearby Rooms
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-card/50">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-accent">RoomDekho</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No Broker, No Commission</h3>
              <p className="text-muted-foreground">
                Connect directly with room owners. Save money on broker fees and commissions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Nearby Rooms</h3>
              <p className="text-muted-foreground">
                View available rooms on an interactive map. See exact locations and distances instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-lg p-8 hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Direct Contact</h3>
              <p className="text-muted-foreground">
                Message or call room owners directly via WhatsApp. Quick responses and real conversations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-accent/10 via-transparent to-accent/10">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Room?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of renters finding rooms without brokers. Start your search today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              onClick={handleFindRooms}
            >
              Find a Room Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
              onClick={handleListRoom}
            >
              List Your Room
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2024 RoomDekho. All rights reserved. No brokers. No commissions. Just rooms.</p>
        </div>
      </footer>
    </div>
  );
}
