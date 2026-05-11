import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { addRoom } from '@/lib/firestore';
import { trpc } from '@/lib/trpc';
import { Home, Wifi, Car, Droplets, Tv, FileText, Sparkles, Loader2, LogIn } from 'lucide-react';

const amenityIcons: Record<string, any> = {
  AC: Droplets,
  Wifi: Wifi,
  Parking: Car,
  Furnished: Home,
  'Power Backup': Sparkles,
  Lift: Home,
  Kitchen: Home,
  'Washing Machine': Droplets,
  Fridge: Droplets,
  TV: Tv,
};

const AMENITIES = [
  'AC',
  'Wifi',
  'Parking',
  'Furnished',
  'Power Backup',
  'Lift',
  'Kitchen',
  'Washing Machine',
  'Fridge',
  'TV',
];

type Amenity = typeof AMENITIES[number];

function AuthCard() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useFirebaseAuth();
  const [, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        if (!displayName.trim()) {
          toast.error('Please enter your name');
          setAuthLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        toast.success('Account created! You are now signed in.');
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'Email already in use. Try signing in.'
        : error.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : error.code === 'auth/weak-password'
            ? 'Password must be at least 6 characters.'
            : error.message || 'Authentication failed';
      toast.error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Google Sign-In not enabled. Use email/password instead.');
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google sign-in failed. Try email/password.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-2xl">
            {authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {authMode === 'signup'
              ? 'Create an account to list your room'
              : 'Sign in to manage your listings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign-In */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Full Name</Label>
                <Input
                  id="auth-name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={authLoading}
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {authMode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {authMode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  className="text-accent hover:underline font-medium"
                  onClick={() => setAuthMode('signin')}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  className="text-accent hover:underline font-medium"
                  onClick={() => setAuthMode('signup')}
                >
                  Create Account
                </button>
              </>
            )}
          </p>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ListRoom() {
  const [form, setForm] = useState({
    title: '',
    price: '',
    type: '1bhk' as string,
    address: '',
    description: '',
    amenities: [] as Amenity[],
    ownerPhone: '',
    lat: '',
    lng: '',
  });

  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useFirebaseAuth();

  const generateDescription = trpc.rooms.generateDescription.useMutation({
    onSuccess: (data) => {
      setForm((prev) => ({ ...prev, description: data.description }));
      setGeneratingDesc(false);
      toast.success('Description generated!');
    },
    onError: () => {
      setGeneratingDesc(false);
      toast.error('Failed to generate description. Please write manually.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    if (!form.title || !form.price || !form.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await addRoom({
        title: form.title,
        description: form.description || `${form.type.toUpperCase()} available for rent at ${form.address}`,
        price: parseFloat(form.price),
        address: form.address,
        type: form.type,
        amenities: form.amenities,
        lat: form.lat ? parseFloat(form.lat) : 0,
        lng: form.lng ? parseFloat(form.lng) : 0,
        ownerName: user.displayName || 'Owner',
        ownerPhone: form.ownerPhone || user.phoneNumber || '',
        ownerUid: user.uid,
        available: true,
      });

      toast.success('Room listed successfully! 🎉');
      setLocation('/dashboard');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to list room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIHelp = () => {
    if (!form.price || !form.address) {
      toast.error('Enter price and address first');
      return;
    }

    setGeneratingDesc(true);

    generateDescription.mutate({
      rent: parseFloat(form.price),
      type: form.type,
      amenities: form.amenities,
      location: form.address,
    });
  };

  const toggleAmenity = (amenity: Amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Show loading while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const [geoLoading, setGeoLoading] = useState(false);

  // Show auth card if not authenticated
  if (!user) {
    return <AuthCard />;
  }


  // Load/ensure Google Maps JS is available so we can reverse-geocode coordinates.
  const ensureGoogleMaps = async () => {
    if (window.google?.maps?.Geocoder) return;

    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      // If already loading, just resolve after a short delay.
      if (document.getElementById("__google_maps_script")) {
        setTimeout(() => resolve(), 800);
        return;
      }

      const script = document.createElement("script");
      script.id = "__google_maps_script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=geocoding`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps script"));
      document.head.appendChild(script);
    });
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    try {
      const getPosition = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });

      const pos = await getPosition();
      const { latitude, longitude } = pos.coords;

      setForm((prev) => ({
        ...prev,
        lat: String(latitude),
        lng: String(longitude),
      }));

      // Reverse geocode to fill address (if Google Maps JS API is available)
      await ensureGoogleMaps();

      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            if (status === "OK" && results?.[0]?.formatted_address) {
              setForm((prev) => ({ ...prev, address: results[0].formatted_address }));
            } else {
              toast.error("Could not find address from your location");
            }
          }
        );
      } else {
        toast("Location saved. Please enter address manually.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to get current location. Please allow location permissions.");
    } finally {
      setGeoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-accent">List Your Room</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user.displayName}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create Room Listing</CardTitle>
            <CardDescription>Fill in the details to list your room for tenants to find</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Room Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Cozy 1BHK near Metro Station"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Price + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Rent (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g. 8000"
                    value={form.price}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="1bhk">1 BHK</SelectItem>
                      <SelectItem value="2bhk">2 BHK</SelectItem>
                      <SelectItem value="shared">Shared Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Full address with city"
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, address: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-accent text-accent hover:bg-accent/10 whitespace-nowrap"
                      disabled={geoLoading}
                      onClick={handleUseCurrentLocation}
                    >
                      {geoLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        "Use my current location"
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to auto-fill lat/lng and (if available) the address.
                </p>
              </div>


              {/* Location coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude*</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    placeholder="e.g. 19.0760"
                    value={form.lat}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lat: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude*</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    placeholder="e.g. 72.8777"
                    value={form.lng}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lng: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Owner Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">WhatsApp Number</Label>
                <Input
                  id="phone"
                  placeholder="+91 9162471191"
                  value={form.ownerPhone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ownerPhone: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">Tenants will contact you on this number via WhatsApp</p>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {AMENITIES.map((amenity) => {
                    const Icon = amenityIcons[amenity] || FileText;

                    return (
                      <label
                        key={amenity}
                        className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                          form.amenities.includes(amenity)
                            ? 'border-accent bg-accent/10'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <Checkbox
                          checked={form.amenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your room, neighborhood, nearby landmarks..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIHelp}
                  disabled={generatingDesc}
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  {generatingDesc ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate Description
                    </>
                  )}
                </Button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  '🚀 Publish Room Listing'
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}