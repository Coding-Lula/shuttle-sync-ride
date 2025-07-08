
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DollarSign, Loader2 } from 'lucide-react';
import { useRates } from '@/hooks/useRates';

export default function RateManagement() {
  const { activeRate, isLoading, updateRate } = useRates();
  const [newRate, setNewRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateRate = async () => {
    const rateValue = parseFloat(newRate);
    if (rateValue && rateValue > 0) {
      setIsSubmitting(true);
      await updateRate(rateValue);
      setNewRate('');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading rates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Trip Rate Management</span>
        </CardTitle>
        <CardDescription>Manage the rate charged per kilometer for trips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Current Rate</h4>
            <p className="text-2xl font-bold text-blue-600">
              R{activeRate?.rate_per_km || '6.00'} per km
            </p>
            <p className="text-sm text-blue-700">Currency: {activeRate?.currency || 'ZAR'}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Update Rate</h4>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter new rate (e.g., 7.50)"
                type="number"
                step="0.01"
                min="0"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
              />
              <Button onClick={handleUpdateRate} disabled={isSubmitting || !newRate}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Rate'
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              This will set a new rate for all future trips. Currency is fixed to South African Rand (ZAR).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
