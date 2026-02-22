"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Train {
  id: number;
  train_number: string;
  name: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  available_seats: number;
}

export default function Home() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchAllTrains = async () => {

      setIsLoading(true);
      try {
        const data = await fetchApi('/trains/search/');
        setTrains(data);
      } catch (err: any) {
        console.error('Error fetching trains contextually:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAllTrains();
    }
  }, [isAuthenticated]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTrains([]);
    setBookingError('');
    setBookingSuccess('');

    try {
      const data = await fetchApi(`/trains/search/?source=${source}&destination=${destination}`);
      setTrains(data);
      if (data.length === 0) {
        setError('No trains found for this route.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search trains');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async (trainId: number) => {
    if (!isAuthenticated) {
      setBookingError('You must be logged in to book a seat.');
      return;
    }

    setBookingError('');
    setBookingSuccess('');

    try {
      await fetchApi('/bookings/', {
        method: 'POST',
        body: JSON.stringify({ train: trainId, seats_booked: 1 }),
      });
      setBookingSuccess('Ticket booked successfully!');

      // Refresh the search to show updated seats
      handleSearch({ preventDefault: () => { } } as React.FormEvent);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book ticket');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Search Trains</h2>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <Input
            label="Source Station"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., CityA"
            className="flex-1"
          />
          <Input
            label="Destination Station"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., CityB"
            className="flex-1"
          />
          <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
            Search
          </Button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>

      {(bookingError || bookingSuccess) && (
        <div className={`p-4 rounded-md ${bookingError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="text-sm font-medium">{bookingError || bookingSuccess}</p>
        </div>
      )}

      {trains.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trains.map((train) => (
                <tr key={train.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{train.name}</div>
                    <div className="text-sm text-gray-500">#{train.train_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{train.source} &rarr; {train.destination}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Dep: {new Date(train.departure_time).toLocaleString()}</div>
                    <div>Arr: {new Date(train.arrival_time).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${train.available_seats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {train.available_seats} / {train.total_seats} Seats
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      onClick={() => handleBook(train.id)}
                      disabled={train.available_seats <= 0}
                      size="sm"
                    >
                      Book Ticket
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
