'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import {
    generateAvonPost,
    sendMessageToChannel,
    fetchGroups,
    GenerateAvonPostResponse,
    GroupResponse,
    logout,
    getUsername,
} from '@/lib/api';
import { HiOutlineSparkles, HiOutlineClipboardCopy, HiOutlinePaperAirplane } from 'react-icons/hi';

export default function AvonPostPage() {
    // State management
    const [productName, setProductName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<GenerateAvonPostResponse | null>(null);
    const [editedPost, setEditedPost] = useState('');
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
    const [sending, setSending] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Load groups on demand when user clicks send button area
    const loadGroups = async () => {
        if (groups.length > 0) return; // Already loaded
        setLoadingGroups(true);
        try {
            const data = await fetchGroups();
            // Filter only active groups
            const activeGroups = data.filter((g) => g.settings?.is_active);
            setGroups(activeGroups);
        } catch (err) {
            console.error('Failed to load groups:', err);
            setError('Ошибка загрузки групп');
        } finally {
            setLoadingGroups(false);
        }
    };

    // Handle generate button click
    const handleGenerate = async () => {
        if (!productName.trim()) {
            setError('Введите название продукта');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await generateAvonPost(productName);
            setResult(response);
            setEditedPost(response.post_text);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка генерации поста');
        } finally {
            setLoading(false);
        }
    };

    // Handle copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(editedPost);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            alert('Ошибка копирования в буфер обмена');
        }
    };

    // Handle send to channels
    const handleSend = async () => {
        if (selectedGroups.length === 0) {
            alert('Выберите хотя бы одну группу');
            return;
        }

        setSending(true);
        let successCount = 0;
        let errorCount = 0;

        for (const chatId of selectedGroups) {
            try {
                const res = await sendMessageToChannel(chatId, editedPost, 'MarkdownV2');
                if (res.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (err) {
                console.error(`Failed to send to ${chatId}:`, err);
                errorCount++;
            }
        }

        setSending(false);
        alert(`Отправлено: ${successCount} успешно, ${errorCount} ошибок`);
        setSelectedGroups([]);
    };

    // Toggle group selection
    const toggleGroup = (chatId: number) => {
        setSelectedGroups((prev) =>
            prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]
        );
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-gray-900">
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
                            <HiOutlineSparkles className="text-pink-500" />
                            Генератор постов Avon
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

                {/* Input section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Название продукта Avon
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Например: Anew Ultimate Night Cream"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleGenerate();
                            }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !productName.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Создаём...
                                </>
                            ) : (
                                <>
                                    <HiOutlineSparkles />
                                    Создать пост
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        ⚠️ {error}
                    </div>
                )}

                {/* Results section */}
                {result && (
                    <div className="space-y-6">
                        {/* Metadata */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                <strong>Поисковый запрос:</strong> {result.search_query}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <strong>Результатов найдено:</strong> {result.search_results.length}
                                {result.cached && (
                                    <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                        из кэша
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Editable post */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Сгенерированный пост (редактируемый)
                                </label>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                                    Telegram MarkdownV2
                                </span>
                            </div>
                            <div className="mb-2 text-xs text-gray-500 bg-gray-50 rounded p-2 border border-gray-200">
                                ℹ️ Пост отформатирован в <strong>Telegram MarkdownV2</strong>.
                                При отправке через кнопку &quot;Отправить в каналы&quot; форматирование применится автоматически.
                                При ручной отправке используйте режим <code className="bg-gray-200 px-1 rounded">parse_mode=MarkdownV2</code>
                            </div>
                            <textarea
                                value={editedPost}
                                onChange={(e) => setEditedPost(e.target.value)}
                                rows={15}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm text-gray-900"
                            />

                            {/* Actions */}
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <HiOutlineClipboardCopy />
                                    {copySuccess ? 'Скопировано!' : 'Скопировать'}
                                </button>
                                <button
                                    onClick={loadGroups}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <HiOutlinePaperAirplane />
                                    Отправить в каналы
                                </button>
                            </div>
                        </div>

                        {/* Channel selection (shown after clicking "Send to channels") */}
                        {groups.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Выберите каналы для отправки
                                </h3>
                                {loadingGroups ? (
                                    <p className="text-gray-500">Загрузка групп...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {groups.map((g) => (
                                            <label
                                                key={g.chat.id}
                                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGroups.includes(
                                                        g.chat.telegram_chat_id
                                                    )}
                                                    onChange={() =>
                                                        toggleGroup(g.chat.telegram_chat_id)
                                                    }
                                                    className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                                                />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {g.chat.title || 'Без названия'}
                                                </span>
                                                {g.settings?.is_mod_group && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                        MOD
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {groups.length > 0 && (
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || selectedGroups.length === 0}
                                        className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {sending
                                            ? 'Отправка...'
                                            : `Отправить в ${selectedGroups.length} ${selectedGroups.length === 1 ? 'канал' : 'каналов'}`}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Search results preview */}
                        <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <summary className="cursor-pointer font-semibold text-gray-900">
                                Источники (результаты поиска)
                            </summary>
                            <div className="mt-4 space-y-4">
                                {result.search_results.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="border-l-4 border-pink-400 pl-4">
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                            {idx + 1}. {item.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1">{item.snippet}</p>
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                        >
                                            {item.link}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </main>
    );
}
