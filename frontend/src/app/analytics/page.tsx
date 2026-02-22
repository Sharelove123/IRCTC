"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface RouteStats {
    source: string;
    destination: string;
    search_count: number;
}

export default function Analytics() {
    const [routes, setRoutes] = useState<RouteStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin) {
            return;
        }

        const loadAnalytics = async () => {
            try {
                const data = await fetchApi('/analytics/top-routes/');
                if (Array.isArray(data)) {
                    setRoutes(data);
                } else {
                    setError(data.error || 'Failed to analyze records');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load analytics');
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalytics();
    }, [isAdmin]);

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading analytics data...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard - Top Routes</h2>

            {error && <div className="text-red-500 bg-red-50 p-4 rounded-md text-sm font-medium">{error}</div>}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Most Searched Train Routes</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Aggregated live from MongoDB search logs across all users.</p>
                </div>

                {routes.length === 0 && !error ? (
                    <div className="p-8 text-center text-gray-500">No search logs available yet. Perform some searches first!</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {routes.map((route, index) => (
                            <li key={`${route.source}-${route.destination}`} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center">
                                    <span className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-200 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                        #{index + 1}
                                    </span>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">{route.source} <span className="text-gray-400 mx-2">&rarr;</span> {route.destination}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {route.search_count} searches
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
