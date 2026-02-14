'use client';

import Image from 'next/image';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { HiOutlinePrinter } from 'react-icons/hi';

type CardProps = {
  title: string;
  address1: string;
  address2: string;
  hours: string;
  phone: string;
  tgUrl: string;
};

function BusinessCard({
  title,
  address1,
  address2,
  hours,
  phone,
  tgUrl,
}: CardProps) {
  const shortUrl = tgUrl.replace(/^https?:\/\//, '').toUpperCase();

  return (
    <div
      className="
        w-[55mm] h-[85mm]
        rounded-none border border-black print:border-0
        bg-white
        px-[3mm] pt-[4mm] pb-[4mm]
        flex flex-col
        print:shadow-none
      "
    >
      {/* Title */}
      <div className="text-center font-bold leading-tight text-[12pt] text-black">
        {title}
      </div>

      {/* Address */}
      <div className="mt-[2.5mm] text-center text-[9pt] leading-tight text-black">
        <div>{address1}</div>
        <div>{address2}</div>
      </div>

      {/* Hours */}
      <div className="mt-[3mm] text-center text-[9pt] font-medium text-black">
        {hours}
      </div>

      {/* Phone */}
      <div className="mt-[3mm] text-center font-bold text-[10.5pt] text-black">
        {phone}
      </div>

      {/* QR + footer */}
      <div className="mt-auto flex flex-col items-center">
        <Image
          src="/qr.png"
          alt="QR"
          width={88}
          height={88}
          className="w-[22mm] h-[22mm] grayscale"
          priority
        />

        {/* Guaranteed breathing room from bottom border */}
        <div className="mt-[1.8mm] text-center text-black">
          <div className="text-[7pt] leading-tight mb-[0.8mm]">
            Сканируйте или перейдите:
          </div>
          <div
            className="
              text-[7.5pt]
              leading-[1.05]
              font-medium
              uppercase
              tracking-tight
              break-all
              pb-[0.8mm]
            "
          >
            {shortUrl}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintableCardsPage() {
  const cardData: CardProps = {
    title: 'Лавка здоровья и красоты',
    address1: 'Ул. Ленина, д. 3,',
    address2: 'ост. «Горячий Хлеб»',
    hours: 'С 11 до 20 Без выходных',
    phone: '8-926-397-33-23',
    tgUrl: 'https://t.me/avon_lytkarino',
  };

  // 9 cards per page (3 x 3)
  const TOTAL_CARDS = 9;
  const cards = Array.from({ length: TOTAL_CARDS }, () => ({ ...cardData }));

  return (
    <main className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-6 print:hidden">
        <Breadcrumbs items={[{ label: 'Визитные карточки' }]} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: preview */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📇 Предварительный просмотр
              </h2>

              <div className="flex justify-center bg-gray-100 p-4 rounded-lg border border-dashed border-gray-300 overflow-auto">
                <BusinessCard {...cardData} />
              </div>

              <div className="mt-8 space-y-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <HiOutlinePrinter className="w-6 h-6" />
                  Печать визиток
                </button>

                <p className="text-sm text-gray-500 text-center italic">
                  Совет: отключите «Верхние и нижние колонтитулы», масштаб 100%.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">
                Информация о печати
              </h3>
              <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                <li>Размер: 55 × 85 мм (вертикальная)</li>
                <li>На листе A4: 9 шт. (3×3)</li>
                <li>Бумага: 200–300 г/м²</li>
              </ul>
            </div>
          </div>

          {/* Right: page mock */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Макет листа
              </h2>
              <p className="text-gray-600 mb-6">
                Печать: {TOTAL_CARDS} визиток (3×3), оптимизировано по высоте.
              </p>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center overflow-auto max-h-[650px]">
                <div className="scale-50 origin-top transform">
                  <div className="bg-white p-[8mm] shadow-2xl border border-gray-300">
                    <div className="grid grid-cols-3 gap-x-[5mm] gap-y-[5mm]">
                      {cards.map((c, idx) => (
                        <BusinessCard {...c} key={idx} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                Если принтер всё ещё оставляет “воздух”, попробуйте “Fit to
                page” выключить, оставить 100%.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only grid (no gaps, single shared border lines) */}
      <div className="hidden print:block">
        <div className="print-grid">
          {cards.map((c, idx) => (
            <div
              key={idx}
              className={[
                'card-wrap',
                // shared grid lines:
                'border-black border-t border-l',
                // add outer border on last col / last row:
                (idx + 1) % 3 === 0 ? 'border-r' : '',
                idx >= 6 ? 'border-b' : '',
              ].join(' ')}
            >
              <BusinessCard {...c} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }

          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 55mm);
            grid-template-rows: repeat(3, 85mm);
            gap: 0 !important;
            justify-content: center;
            align-content: start;
          }

          .card-wrap {
            break-inside: avoid;
            page-break-inside: avoid;
            padding: 0;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}
