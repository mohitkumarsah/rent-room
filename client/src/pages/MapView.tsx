import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, MessageCircle, X, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { GoogleMap } from "@/components/Map";
import { getRooms, type Room } from "@/lib/firestore";

export default function MapViewPage() {
  const [, setLocation] = useLocation();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Mumbai
          setUserLocation({ lat: 19.0760, lng: 72.8777 });
        }
      );
    } else {
      setUserLocation({ lat: 19.0760, lng: 72.8777 });
    }
  }, []);

  // Fetch real rooms from Firestore
  useEffect(() => {
    async function fetchRooms() {
      try {
        const firestoreRooms = await getRooms();
        if (userLocation) {
          const roomsWithDistance = firestoreRooms.map((room) => ({
            ...room,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              room.lat || 0,
              room.lng || 0
            ),
          }));
          // Sort by distance
          roomsWithDistance.sort((a, b) => (a.distance || 999) - (b.distance || 999));
          setRooms(roomsWithDistance as any);
        } else {
          setRooms(firestoreRooms);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [userLocation]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    if (!lat2 && !lon2) return 999;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleWhatsAppClick = (room: Room) => {
    const message = `Hi, I'm interested in the room "${room.title}" at ${room.address}. Price: ₹${room.price}/month. Can you provide more details?`;
    const phone = room.ownerPhone?.replace(/\D/g, "") || "";
    if (!phone) {
      return;
    }
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleOpenInMaps = (room: Room) => {
    if (room.lat && room.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${room.lat},${room.lng}`;
      window.open(mapsUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading nearby rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-accent">Nearby Rooms</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Real Google Map */}
      <GoogleMap
        className="w-full h-[60vh]"
        initialCenter={userLocation || { lat: 19.0760, lng: 72.8777 }}
        initialZoom={12}
        onMapReady={(map) => {
          // Add markers for rooms
          rooms.forEach((room) => {
            if (room.lat && room.lng) {
              const marker = new google.maps.Marker({
                position: { lat: room.lat, lng: room.lng },
                map,
                title: room.title,
                label: `₹${Math.floor(room.price / 1000)}k`,
              });
              marker.addListener("click", () => {
                setSelectedRoom(room);
              });
            }
          });
          if (userLocation) {
            new google.maps.Marker({
              position: userLocation,
              map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285f4",
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "#ffffff",
              },
              title: "Your location",
            });
          }
        }}
      />

      {/* Legend */}
      <div className="p-4 bg-card/80 border-b border-border flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-accent rounded-full" />
          <span>Room</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>You</span>
          </div>
        )}
        <span className="text-muted-foreground ml-auto">{rooms.length} rooms found</span>
      </div>

      {/* Room List */}
      <div className="container py-8">
        <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
        {rooms.length === 0 ? (
          <Card className="bg-card border-border p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rooms available nearby. Check back later!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer overflow-hidden"
                onClick={() => setSelectedRoom(room)}
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
                      <MapPin className="w-8 h-8 text-accent/50" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{room.title}</h3>
                    {!room.available && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        Not Available
                      </span>
                    )}
                  </div>
                  <p className="text-accent font-bold text-lg mb-2">
                    ₹{room.price.toLocaleString()}/month
                  </p>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {room.address}
                  </p>
                  {(room as any).distance != null && (
                    <p className="text-xs text-muted-foreground mb-3">
                      📍 {((room as any).distance as number).toFixed(1)} km away
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsAppClick(room);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Owner
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet - Room Details */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedRoom(null)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">{selectedRoom.title}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRoom(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Photo */}
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedRoom.photoUrl ? (
                  <img
                    src={selectedRoom.photoUrl}
                    alt={selectedRoom.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10">
                    <MapPin className="w-12 h-12 text-accent/50" />
                  </div>
                )}
              </div>

              {/* Price and Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <p className="text-3xl font-bold text-accent">
                    ₹{selectedRoom.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`font-semibold ${selectedRoom.available ? "text-green-500" : "text-red-500"}`}>
                    {selectedRoom.available ? "Available" : "Not Available"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedRoom.description && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{selectedRoom.description}</p>
                </div>
              )}

              {/* Address and Distance */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{selectedRoom.address}</p>
                {(selectedRoom as any).distance != null && (
                  <p className="text-sm text-accent">
                    📍 {((selectedRoom as any).distance as number).toFixed(1)} km from your location
                  </p>
                )}
              </div>

              {/* Amenities */}
              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity) => (
                      <span key={amenity} className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Info */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="font-medium">{selectedRoom.ownerName}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => handleWhatsAppClick(selectedRoom)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-accent text-accent hover:bg-accent/10"
                  onClick={() => handleOpenInMaps(selectedRoom)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
