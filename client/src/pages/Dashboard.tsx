import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Eye,
  MessageSquare,
  Plus,
  MoreVertical,
  LogOut,
  Settings,
  Loader2,
  LogIn,
  MapPin,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { getRoomsByOwner, deleteRoom, updateRoom, type Room } from "@/lib/firestore";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, signInWithGoogle, logout } = useFirebaseAuth();
  const [listings, setListings] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Fetch owner rooms from Firestore
  useEffect(() => {
    async function fetchRooms() {
      if (!user) {
        setLoadingRooms(false);
        return;
      }
      try {
        const rooms = await getRoomsByOwner(user.uid);
        setListings(rooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load your listings");
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, [user]);

  const handleToggleActive = async (id: string) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;

    try {
      await updateRoom(id, { available: !listing.available });
      setListings((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, available: !l.available } : l
        )
      );
      toast.success(
        `Listing ${listing.available ? "deactivated" : "activated"}!`
      );
    } catch (error) {
      console.error("Error toggling listing:", error);
      toast.error("Failed to update listing");
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteRoom(id);
      setListings((prev) => prev.filter((listing) => listing.id !== id));
      toast.success("Listing deleted!");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to list-room which has full auth UI
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to access your owner dashboard and manage your room listings.
          </p>
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mb-3"
            onClick={() => setLocation("/list-room")}
          >
            Sign In / Create Account
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setLocation("/")}
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.available).length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalInquiries = listings.reduce((sum, l) => sum + (l.inquiries || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-lg font-bold text-accent">RoomDekho</span>
        </div>

        {/* User Info */}
        <div className="mb-6 p-3 bg-accent/10 rounded-lg">
          <p className="text-sm font-medium truncate">{user.displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button className="w-full text-left px-4 py-3 rounded-lg bg-accent/20 text-accent font-medium flex items-center gap-3">
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setLocation("/listings")}
            className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-card/50 flex items-center gap-3"
          >
            <Eye className="w-5 h-5" />
            Browse Rooms
          </button>
          <button
            onClick={() => setLocation("/list-room")}
            className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-card/50 flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            List New Room
          </button>
          <button
            onClick={() => setLocation("/map")}
            className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-card/50 flex items-center gap-3"
          >
            <MapPin className="w-5 h-5" />
            Nearby Rooms
          </button>
        </nav>

        <div className="space-y-2 border-t border-border pt-4">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-muted-foreground hover:bg-card/50 flex items-center gap-3"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="container h-16 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-accent">Owner Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Welcome, {user.displayName?.split(" ")[0]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                Home
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container py-8">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Listings</p>
                  <p className="text-3xl font-bold text-accent">{totalListings}</p>
                </div>
                <Home className="w-10 h-10 text-accent/30" />
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-500">{activeListings}</p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-accent">{totalViews}</p>
                </div>
                <Eye className="w-10 h-10 text-accent/30" />
              </div>
            </Card>

            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inquiries</p>
                  <p className="text-3xl font-bold text-accent">{totalInquiries}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-accent/30" />
              </div>
            </Card>
          </div>

          {/* Listings Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Listings</h2>
              <Button
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setLocation("/list-room")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Room
              </Button>
            </div>

            {loadingRooms ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : listings.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No listings yet. List your first room!</p>
                <Button
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => setLocation("/list-room")}
                >
                  Create Your First Listing
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="bg-card border-border p-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex gap-6">
                      {/* Photo */}
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {listing.photoUrl ? (
                          <img
                            src={listing.photoUrl}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent/10">
                            <Home className="w-6 h-6 text-accent/50" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {listing.address}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              listing.available
                                ? "bg-green-500/20 text-green-500"
                                : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {listing.available ? "Active" : "Inactive"}
                          </div>
                        </div>

                        <p className="text-accent font-bold text-lg mb-2">
                          ₹{listing.price.toLocaleString()}/month
                        </p>

                        {listing.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {listing.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {listing.views || 0} views
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {listing.inquiries || 0} inquiries
                            </span>
                          </div>
                          {listing.type && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                              {listing.type.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`border-accent text-accent hover:bg-accent/10 ${
                              listing.available ? "" : "opacity-50"
                            }`}
                            onClick={() => handleToggleActive(listing.id)}
                          >
                            {listing.available ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>

                      {/* Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-red-500"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
