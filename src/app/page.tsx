'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { HiOutlineDocumentText, HiOutlineIdentification } from 'react-icons/hi';

interface Tool {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  active: boolean;
  badge?: string;
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.active ? tool.href : '#'}
      className={`
        group relative flex flex-col h-full bg-white rounded-2xl shadow-lg 
        overflow-hidden transition-all duration-300 border border-gray-100
        ${tool.active 
          ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' 
          : 'opacity-80 cursor-not-allowed'
        }
      `}
    >
      {/* Content Area */}
      <div className="p-8 flex-grow">
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors text-4xl">
            {tool.icon}
          </div>
          {tool.badge && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">
              {tool.badge}
            </span>
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
          {tool.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed text-[15px] max-w-[280px]">
          {tool.description}
        </p>
      </div>

      {/* Unified Footer Area */}
      <div className={`
        px-8 py-5 flex items-center font-bold text-sm tracking-wide transition-colors
        ${tool.active 
          ? 'bg-gray-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-t border-gray-100' 
          : 'bg-gray-100 text-gray-400 border-t border-gray-200'
        }
      `}>
        {tool.active ? 'ОТКРЫТЬ ИНСТРУМЕНТ →' : 'В РАЗРАБОТКЕ'}
      </div>
    </Link>
  );
}

export default function MainMenu() {
  const tools: Tool[] = [
    {
      title: 'Генератор объявлений',
      description: 'Создавайте профессиональные объявления формата A4 с идеальным качеством печати. Поддержка всех ориентаций.',
      icon: <HiOutlineDocumentText className="w-10 h-10 text-blue-500" />,
      href: '/ad-generator',
      active: true,
    },
    {
      title: 'Визитные карточки',
      description: 'Конструктор вертикальных визиток 55×85 мм. Оптимизированный макет 3×3 для ручной резки.',
      icon: <HiOutlineIdentification className="w-10 h-10 text-purple-500" />,
      href: '/business-card',
      active: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Добро пожаловать
          </h2>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed">
            Тут будем собирать инструменты, которые упрощают жизнь!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {tools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </div>

      {/* Minimal Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
    </main>
  );
}
