import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Grid3X3, List, MapPin, Loader2, Home } from "lucide-react";
import { useLocation } from "wouter";
import { getRooms, type Room } from "@/lib/firestore";

export default function RoomListings() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [roomType, setRoomType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real rooms from Firestore
  useEffect(() => {
    async function fetchRooms() {
      try {
        const firestoreRooms = await getRooms();
        setRooms(firestoreRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    let filtered = rooms.filter((room) => {
      if (room.price < priceRange.min || room.price > priceRange.max) return false;
      if (roomType !== "all" && room.type !== roomType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !room.title.toLowerCase().includes(query) &&
          !room.address.toLowerCase().includes(query) &&
          !room.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "newest":
      default:
        // Firestore already orders by createdAt desc
        break;
    }

    return filtered;
  }, [rooms, priceRange, roomType, sortBy, searchQuery]);

  const handleWhatsAppClick = (room: Room) => {
    const message = `Hi, I'm interested in the room "${room.title}" at ${room.address}. Price: ₹${room.price}/month. Can you provide more details?`;
    const phone = room.ownerPhone?.replace(/\D/g, "") || "";
    if (!phone) {
      return;
    }
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-accent">Browse Rooms</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/map")}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Map
            </Button>
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

      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="font-bold mb-4">Filters</h3>
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Search
                </label>
                <Input
                  placeholder="Search by title, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mt-2 bg-card border-border"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Price Range
                </label>
                <div className="mt-3 space-y-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min || ""}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="bg-card border-border"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max || ""}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: parseInt(e.target.value) || 100000,
                      }))
                    }
                    className="bg-card border-border"
                  />
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Room Type
                </label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="mt-2 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="shared">Shared Room</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="1bhk">1 BHK</SelectItem>
                    <SelectItem value="2bhk">2 BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View on Map */}
              <Button
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent/10"
                onClick={() => setLocation("/map")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `Showing ${filteredRooms.length} rooms`}
              </p>
              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex gap-2 border border-border rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className={viewMode === "grid" ? "bg-accent text-accent-foreground" : ""}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className={viewMode === "list" ? "bg-accent text-accent-foreground" : ""}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <Card className="bg-card border-border p-12 text-center">
                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No rooms found</p>
                <p className="text-sm text-muted-foreground">
                  {rooms.length === 0
                    ? "No rooms have been listed yet. Be the first!"
                    : "Try adjusting your filters."}
                </p>
                {rooms.length === 0 && (
                  <Button
                    className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => setLocation("/list-room")}
                  >
                    List a Room
                  </Button>
                )}
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="bg-card border-border hover:border-accent/50 transition-colors overflow-hidden"
                  >
                    <div className="aspect-video bg-muted overflow-hidden">
                      {room.photoUrl ? (
                        <img
                          src={room.photoUrl}
                          alt={room.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10">
                          <Home className="w-8 h-8 text-accent/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{room.title}</h3>
                        {room.type && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded whitespace-nowrap ml-2">
                            {room.type.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-accent font-bold text-lg mb-2">
                        ₹{room.price.toLocaleString()}/month
                      </p>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {room.address}
                      </p>
                      {room.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {room.amenities?.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="text-xs bg-accent/20 text-accent px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities && room.amenities.length > 3 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>
                      {room.ownerName && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Listed by {room.ownerName}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleWhatsAppClick(room)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp Owner
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="bg-card border-border hover:border-accent/50 transition-colors p-4 flex gap-4"
                  >
                    <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {room.photoUrl ? (
                        <img
                          src={room.photoUrl}
                          alt={room.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10">
                          <Home className="w-6 h-6 text-accent/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{room.title}</h3>
                          {room.type && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                              {room.type.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-accent font-bold mb-1">
                          ₹{room.price.toLocaleString()}/month
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {room.address}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities?.map((amenity) => (
                            <span
                              key={amenity}
                              className="text-xs bg-accent/20 text-accent px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleWhatsAppClick(room)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
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
