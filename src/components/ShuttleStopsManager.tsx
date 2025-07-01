
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock initial stops data
const initialStops = [
  { id: '1', name: 'Dormitory A', distance: 0, status: 'active' },
  { id: '2', name: 'Dormitory B', distance: 0.8, status: 'active' },
  { id: '3', name: 'Main Campus', distance: 2.3, status: 'active' },
  { id: '4', name: 'Library', distance: 1.8, status: 'active' },
  { id: '5', name: 'Sports Center', distance: 3.1, status: 'active' },
  { id: '6', name: 'Medical Center', distance: 2.7, status: 'active' }
];

const ShuttleStopsManager = () => {
  const [stops, setStops] = useState(initialStops);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStop, setNewStop] = useState({ name: '', distance: '' });
  const [editingStop, setEditingStop] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', distance: '' });
  const { toast } = useToast();

  const addStop = () => {
    if (!newStop.name || !newStop.distance) {
      toast({
        title: "Incomplete information",
        description: "Please fill in both name and distance",
        variant: "destructive",
      });
      return;
    }

    const stop = {
      id: Date.now().toString(),
      name: newStop.name,
      distance: parseFloat(newStop.distance),
      status: 'active'
    };

    setStops([...stops, stop]);
    setNewStop({ name: '', distance: '' });
    setShowAddForm(false);

    toast({
      title: "Stop added",
      description: `${newStop.name} has been added successfully.`,
    });
  };

  const removeStop = (stopId: string) => {
    const stop = stops.find(s => s.id === stopId);
    setStops(stops.filter(s => s.id !== stopId));
    
    toast({
      title: "Stop removed",
      description: `${stop?.name} has been removed successfully.`,
    });
  };

  const startEdit = (stop: any) => {
    setEditingStop(stop.id);
    setEditData({ name: stop.name, distance: stop.distance.toString() });
  };

  const saveEdit = () => {
    if (!editData.name || !editData.distance) {
      toast({
        title: "Incomplete information",
        description: "Please fill in both name and distance",
        variant: "destructive",
      });
      return;
    }

    setStops(stops.map(stop => 
      stop.id === editingStop 
        ? { ...stop, name: editData.name, distance: parseFloat(editData.distance) }
        : stop
    ));

    setEditingStop(null);
    setEditData({ name: '', distance: '' });

    toast({
      title: "Stop updated",
      description: "Stop information has been updated successfully.",
    });
  };

  const cancelEdit = () => {
    setEditingStop(null);
    setEditData({ name: '', distance: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Shuttle Stops Management</span>
            </CardTitle>
            <CardDescription>Manage shuttle stops and their distances</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stop
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium mb-3">Add New Shuttle Stop</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Stop Name"
                value={newStop.name}
                onChange={(e) => setNewStop({...newStop, name: e.target.value})}
              />
              <Input
                placeholder="Distance (km)"
                type="number"
                step="0.1"
                value={newStop.distance}
                onChange={(e) => setNewStop({...newStop, distance: e.target.value})}
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={addStop}>Add Stop</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {stops.map((stop) => (
            <div key={stop.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              {editingStop === stop.id ? (
                <div className="flex items-center space-x-4 flex-1">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="flex-1"
                  />
                  <Input
                    value={editData.distance}
                    onChange={(e) => setEditData({...editData, distance: e.target.value})}
                    type="number"
                    step="0.1"
                    className="w-24"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={saveEdit}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{stop.name}</p>
                      <p className="text-sm text-gray-600">{stop.distance} km from base</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{stop.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(stop)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStop(stop.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShuttleStopsManager;
