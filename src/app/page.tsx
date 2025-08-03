'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Controls from '@/components/Controls';
import Editor from '@/components/Editor';
import Debug from '@/components/Debug';
import { AppState, initialState } from './state';

export default function Home() {
  const [state, setState] = useState<AppState>(initialState);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                ⚙️ Настройки
              </h2>
              <Controls state={state} setState={setState} />
              {state.debugMode && <Debug />}
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📝 Предварительный просмотр
              </h2>
              <Editor state={state} setState={setState} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}