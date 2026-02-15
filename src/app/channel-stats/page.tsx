'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchEvents, ChatEvent, logout, getUsername } from '@/lib/api';

const EVENT_TYPES = [
    { key: '', label: 'Все', emoji: '📋' },
    { key: 'joined', label: 'Вступили', emoji: '➕' },
    { key: 'left', label: 'Вышли', emoji: '➖' },
    { key: 'kicked', label: 'Удалены', emoji: '🚫' },
    { key: 'promoted', label: 'Повышены', emoji: '⬆️' },
    { key: 'demoted', label: 'Понижены', emoji: '⬇️' },
    { key: 'restricted', label: 'Ограничены', emoji: '🔒' },
    { key: 'unrestricted', label: 'Разблокированы', emoji: '🔓' },
];

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function statusBadgeColor(eventType: string): string {
    switch (eventType) {
        case 'joined':
            return 'bg-green-100 text-green-700';
        case 'left':
            return 'bg-yellow-100 text-yellow-700';
        case 'kicked':
        case 'banned':
            return 'bg-red-100 text-red-700';
        case 'promoted':
            return 'bg-blue-100 text-blue-700';
        case 'demoted':
            return 'bg-orange-100 text-orange-700';
        case 'restricted':
            return 'bg-purple-100 text-purple-700';
        case 'unrestricted':
            return 'bg-teal-100 text-teal-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

export default function ChannelStats() {
    const [events, setEvents] = useState<ChatEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    const loadEvents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchEvents({
                event_type: activeFilter || undefined,
                limit: 100,
            });
            setEvents(data.events);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    }, [activeFilter]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ← Назад
                        </Link>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            📊 Статистика каналов
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                            👤 {getUsername() || 'admin'}
                        </span>
                        <button
                            onClick={logout}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                        >
                            Выйти
                        </button>
                    </div>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {EVENT_TYPES.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveFilter(t.key)}
                            className={`
                px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                ${activeFilter === t.key
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }
              `}
                        >
                            {t.emoji} {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            Пока нет событий
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            События появятся, когда пользователи будут вступать или выходить из каналов, где бот является администратором.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Header row */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-2">Дата</div>
                            <div className="col-span-3">Канал</div>
                            <div className="col-span-3">Пользователь</div>
                            <div className="col-span-2">Событие</div>
                            <div className="col-span-2">Переход</div>
                        </div>

                        {/* Event rows */}
                        {events.map(ev => (
                            <div
                                key={ev.id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center"
                            >
                                <div className="col-span-2 text-sm text-gray-500 font-mono">
                                    {formatDate(ev.date)}
                                </div>
                                <div className="col-span-3 text-sm font-semibold text-gray-800 truncate" title={ev.chat_title || `Chat #${ev.chat_id}`}>
                                    {ev.chat_title || `Chat #${ev.chat_id}`}
                                </div>
                                <div className="col-span-3 text-sm text-gray-700 truncate">
                                    {ev.user ? (
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate" title={[ev.user.first_name, ev.user.last_name].filter(Boolean).join(' ')}>
                                                {[ev.user.first_name, ev.user.last_name].filter(Boolean).join(' ')}
                                            </span>
                                            {ev.user.username && (
                                                <span className="text-xs text-blue-500">@{ev.user.username}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Неизвестно</span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span
                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusBadgeColor(ev.event_type)}`}
                                    >
                                        {ev.event_type}
                                    </span>
                                </div>
                                <div className="col-span-2 text-sm text-gray-500">
                                    <span className="text-gray-400">{ev.old_status || '—'}</span>
                                    <span className="mx-1 text-gray-300">→</span>
                                    <span className="font-medium text-gray-700">
                                        {ev.new_status || '—'}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Footer */}
                        <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 font-medium">
                            Показано {events.length} событий
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
        </main>
    );
}
