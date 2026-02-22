export const NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const adminKey = typeof window !== 'undefined' ? localStorage.getItem('admin_key') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (adminKey) {
        headers['x-admin-api-key'] = adminKey;
    }

    const response = await fetch(`${NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.detail || data.error || data.username?.[0] || 'An error occurred');
    }

    return data;
};
