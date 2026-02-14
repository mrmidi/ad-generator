import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            ✨ Инструменты красоты и здоровья
          </h1>
        </Link>
      </div>
    </header>
  );
}
