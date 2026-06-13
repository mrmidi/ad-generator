'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { fetchGroups, updateGroupSettings, GroupResponse, logout, getUsername } from '@/lib/api';
import { HiOutlineUsers, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function GroupsPage() {
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState<number | null>(null);

    const loadGroups = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchGroups();
            setGroups(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGroups();
    }, [loadGroups]);

    const handleToggle = async (chatId: number, field: 'is_active' | 'is_mod_group' | 'enable_spam_filter', currentValue: boolean) => {
        // Optimistic update
        setGroups(prev => prev.map(g => {
            if (g.chat.id === chatId) {
                const settings = g.settings || {
                    id: 0,
                    chat_id: chatId,
                    is_active: false,
                    is_mod_group: false,
                    enable_spam_filter: true,
                    notes: null
                };
                return {
                    ...g,
                    settings: {
                        ...settings,
                        [field]: !currentValue
                    }
                };
            }
            return g;
        }));

        setUpdating(chatId);

        try {
            // Find current state to get the OTHER field values
            const group = groups.find(g => g.chat.id === chatId);
            const currentSettings = group?.settings || { is_active: false, is_mod_group: false, enable_spam_filter: true };

            await updateGroupSettings(chatId, {
                is_active: field === 'is_active' ? !currentValue : currentSettings.is_active,
                is_mod_group: field === 'is_mod_group' ? !currentValue : currentSettings.is_mod_group,
                enable_spam_filter: field === 'enable_spam_filter' ? !currentValue : currentSettings.enable_spam_filter,
            });
        } catch (err) {
            // Revert on error
            console.error(err);
            alert('Ошибка при сохранении настроек');
            loadGroups(); // Reload to sync
        } finally {
            setUpdating(null);
        }
    };

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
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <HiOutlineUsers className="text-purple-600" />
                            Управление группами
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

                {/* Content */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <HiOutlineExclamationCircle className="text-lg" /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-purple-500 animate-spin" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            Боту пока неизвестны никакие группы
                        </h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">
                            Добавьте бота в группы, чтобы они появились здесь.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Название</th>
                                    <th className="px-6 py-4">Тип</th>
                                    <th className="px-6 py-4 text-center">Бот активен</th>
                                    <th className="px-6 py-4 text-center">Спам-фильтр</th>
                                    <th className="px-6 py-4 text-center">Модерация</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {groups.map(group => {
                                    const isActive = group.settings?.is_active ?? false;
                                    const enableSpamFilter = group.settings?.enable_spam_filter ?? true;
                                    const isModGroup = group.settings?.is_mod_group ?? false;

                                    return (
                                        <tr key={group.chat.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                {group.chat.telegram_chat_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {group.chat.title || '(Без названия)'}
                                                </div>
                                                {group.chat.username && (
                                                    <div className="text-xs text-blue-500">
                                                        @{group.chat.username}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`
                                                    inline-flex px-2.5 py-1 rounded-full text-xs font-bold
                                                    ${group.chat.chat_type === 'private' ? 'bg-gray-100 text-gray-600' :
                                                        group.chat.chat_type === 'channel' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'}
                                                `}>
                                                    {group.chat.chat_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isActive}
                                                        onChange={() => handleToggle(group.chat.id, 'is_active', isActive)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={enableSpamFilter}
                                                        onChange={() => handleToggle(group.chat.id, 'enable_spam_filter', enableSpamFilter)}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={isModGroup}
                                                            onChange={() => handleToggle(group.chat.id, 'is_mod_group', isModGroup)}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                                    </label>
                                                    <span className="text-[10px] text-gray-400 mt-1">ОТЧЕТЫ</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
        </main>
    );
}
