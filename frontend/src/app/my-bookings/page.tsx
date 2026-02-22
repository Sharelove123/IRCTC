"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Booking {
    id: number;
    trainName?: string;
    trainNumber?: string;
    train?: number;
    source?: string;
    destination?: string;
    seats_booked: number;
    booking_time: string;
}

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
            router.push('/login');
            return;
        }

        const loadBookings = async () => {
            if (typeof window === 'undefined' || !localStorage.getItem('access_token')) {
                return;
            }

            try {
                const data = await fetchApi('/bookings/my/');
                // Transform the data slightly for presentation since Django returns just the train ID
                // Note: For a fully complete app, the backend would serialize full train details. 
                // We will just show the raw booking data here.
                setBookings(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load bookings contextually');
            } finally {
                setIsLoading(false);
            }
        };

        loadBookings();
    }, [isAuthenticated, router]);

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>

            {error && <div className="text-red-500 bg-red-50 p-4 rounded-md text-sm font-medium">{error}</div>}

            {bookings.length === 0 && !error ? (
                <div className="bg-white p-8 text-center text-gray-500 rounded-lg shadow-sm border border-gray-100">
                    You haven't booked any tickets yet.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Booking #{booking.id}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(booking.booking_time).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Train ID:</span>
                                    <span className="font-medium text-gray-900">{booking.trainName || booking.train}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Seats Booked:</span>
                                    <span className="font-medium text-gray-900">{booking.seats_booked}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
