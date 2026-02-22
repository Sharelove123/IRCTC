"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddTrainPage() {
    const [trainNumber, setTrainNumber] = useState('');
    const [name, setName] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [totalSeats, setTotalSeats] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trains, setTrains] = useState<any[]>([]);

    // The backend uses IsAdminUser which checks JWT, but we removed the naive frontend admin check
    // so legitimate superusers aren't blocked by React state delays.

    const loadTrains = async () => {

        try {
            const data = await fetchApi('/trains/');
            if (Array.isArray(data)) {
                setTrains(data);
            } else if (data && Array.isArray(data.results)) {
                setTrains(data.results);
            }
        } catch (err) {
            console.error('Error fetching trains contextually:', err);
        }
    };

    useEffect(() => {
        loadTrains();
    }, []);

    const handleEdit = (train: any) => {
        setTrainNumber(train.train_number);
        setName(train.name);
        setSource(train.source);
        setDestination(train.destination);

        // Helper to format ISO to datetime-local expected string
        try {
            const formatForInput = (isoString: string) => {
                const d = new Date(isoString);
                return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            };
            setDepartureTime(formatForInput(train.departure_time));
            setArrivalTime(formatForInput(train.arrival_time));
        } catch (e) {
            console.error('Date formatting error:', e);
        }

        setTotalSeats(train.total_seats.toString());

        // Scroll to top of the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await fetchApi('/trains/', {
                method: 'POST',
                body: JSON.stringify({
                    train_number: trainNumber,
                    name,
                    source,
                    destination,
                    departure_time: new Date(departureTime).toISOString(),
                    arrival_time: new Date(arrivalTime).toISOString(),
                    total_seats: parseInt(totalSeats),
                    available_seats: parseInt(totalSeats)
                }),
            });
            setSuccess('Train successfully added/updated in the database!');
            // Reset form
            setTrainNumber('');
            setName('');
            setSource('');
            setDestination('');
            setDepartureTime('');
            setArrivalTime('');
            setTotalSeats('');

            // Reload the list
            loadTrains();
        } catch (err: any) {
            setError(err.message || 'Failed to add train');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin: Create or Update Train</h2>

                {error && <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                {success && <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Train Number" required value={trainNumber} onChange={(e) => setTrainNumber(e.target.value)} />
                        <Input label="Train Name" required value={name} onChange={(e) => setName(e.target.value)} />
                        <Input label="Source Station" required value={source} onChange={(e) => setSource(e.target.value)} />
                        <Input label="Destination Station" required value={destination} onChange={(e) => setDestination(e.target.value)} />
                        <Input label="Departure Time (Local)" type="datetime-local" required value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
                        <Input label="Arrival Time (Local)" type="datetime-local" required value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
                        <Input label="Total Seats" type="number" min="1" required value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" className="w-full md:w-auto" isLoading={isLoading}>
                            Save Train to Database
                        </Button>
                    </div>
                </form>
            </div>

            {/* List Existing Trains */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Existing Trains</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Select a train to populate the form above and securely update the database records in-place.</p>
                </div>

                {trains.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No trains found. Create one above!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trains.map((train, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{train.train_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{train.source} &rarr; {train.destination}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {train.available_seats} / {train.total_seats}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(train)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
