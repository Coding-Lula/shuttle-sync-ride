
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { useShuttleStops } from '@/hooks/useShuttleStops';

export default function ShuttleStopsDisplay() {
  const { stops, isLoading } = useShuttleStops();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading shuttle stops...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Shuttle Stops</span>
        </CardTitle>
        <CardDescription>Current shuttle stop locations and distances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stops.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No shuttle stops configured yet.</p>
          ) : (
            stops.map((stop) => (
              <div key={stop.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{stop.name}</p>
                    <p className="text-sm text-gray-600">{stop.distance_km} km from campus</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">R{(stop.distance_km * 6).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">estimated cost</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
