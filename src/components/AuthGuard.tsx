'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated, fetchMe, clearAuth } from '@/lib/api';
import LoginForm from '@/components/LoginForm';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    const checkAuth = async () => {
        if (!isAuthenticated()) {
            setStatus('unauthenticated');
            return;
        }

        // Validate token with backend
        const me = await fetchMe();
        if (me) {
            setStatus('authenticated');
        } else {
            clearAuth();
            setStatus('unauthenticated');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Проверка доступа...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <LoginForm onSuccess={() => setStatus('authenticated')} />;
    }

    return <>{children}</>;
}
