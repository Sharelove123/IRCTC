"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
    const { isAuthenticated, logout, isAdmin } = useAuth();

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-blue-600">
                                IRCTC Lite
                            </Link>
                        </div>
                        <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Search Trains
                            </Link>
                            {isAuthenticated && (
                                <Link href="/my-bookings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    My Bookings
                                </Link>
                            )}
                            {isAdmin && (
                                <>
                                    <Link href="/analytics" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Analytics
                                    </Link>
                                    <Link href="/admin/add-train" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Manage Trains
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {!isAuthenticated ? (
                            <div className="space-x-4">
                                <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                                    Log in
                                </Link>
                                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <button
                                onClick={logout}
                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Log out
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
