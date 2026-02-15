'use client';

import { useState } from 'react';
import { login } from '@/lib/api';

interface LoginFormProps {
    onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo area */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                        <span className="text-3xl text-white font-black">B&H</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Инструменты B&H
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Войдите для доступа к инструментам
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5"
                >
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="login"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Имя пользователя
                        </label>
                        <input
                            id="login"
                            name="login"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoFocus
                            autoComplete="username"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="pass"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Пароль
                        </label>
                        <input
                            id="pass"
                            name="pass"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                    >
                        {loading ? 'ВХОД...' : 'ВОЙТИ'}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-xs mt-6">
                    Доступ только для администраторов
                </p>
            </div>
        </div>
    );
}
