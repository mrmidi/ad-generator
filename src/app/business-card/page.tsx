'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { HiOutlinePrinter, HiOutlineSparkles, HiOutlineIdentification } from 'react-icons/hi';

type VerticalCardProps = {
  title: string;
  address1: string;
  address2: string;
  hours: string;
  phone: string;
  tgUrl: string;
};

type CompactCardProps = {
  title: string;
  address1: string;
  address2: string;
  hours: string;
  phone: string;
  name: string;
};

type CardType = 'compact' | 'vertical';

/**
 * Vertical standard business card with QR code (55 × 85 mm, 9 per A4)
 */
function VerticalBusinessCard({
  title,
  address1,
  address2,
  hours,
  phone,
  tgUrl,
}: VerticalCardProps) {
  const shortUrl = tgUrl.replace(/^https?:\/\//, '').toUpperCase();

  return (
    <div
      className="
        w-[55mm] h-[85mm]
        rounded-none border border-black print:border-0
        bg-white
        px-[3mm] pt-[4mm] pb-[4mm]
        flex flex-col
        box-border
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

/**
 * Compact horizontal mini business card (65 × 35 mm, 24 per A4, 3 columns × 8 rows)
 * Designed for maximum sheet density and easy manual cutting.
 */
function CompactBusinessCard({
  title,
  address1,
  address2,
  hours,
  phone,
  name,
}: CompactCardProps) {
  return (
    <div
      className="
        w-[65mm] h-[35mm]
        rounded-none border border-black print:border-0
        bg-white text-black
        px-[2.5mm] py-[2mm]
        flex flex-col justify-between items-center text-center
        box-border
        print:shadow-none
      "
    >
      {/* Title */}
      <div className="font-bold text-[9.5pt] leading-tight tracking-tight">
        {title}
      </div>

      {/* Address */}
      <div className="text-[7.5pt] leading-[1.15]">
        <div>{address1}</div>
        <div>{address2}</div>
      </div>

      {/* Hours */}
      <div className="text-[7.5pt] font-medium leading-[1.15]">
        {hours}
      </div>

      {/* Phone */}
      <div className="font-bold text-[9.5pt] leading-tight tracking-wide">
        {phone}
      </div>

      {/* Contact Name */}
      <div className="font-bold text-[9pt] leading-tight">
        {name}
      </div>
    </div>
  );
}

export default function PrintableCardsPage() {
  const [cardType, setCardType] = useState<CardType>('compact');

  // Compact mini card data (65 × 35 mm, 24 pcs)
  const compactData: CompactCardProps = {
    title: 'Лавка здоровья и красоты',
    address1: 'Ул. Ленина, д. 3,',
    address2: 'ост. «Горячий Хлеб»',
    hours: 'С 11 до 20 Без выходных',
    phone: '8-995-558-29-13',
    name: 'Анна',
  };

  // Vertical card data with QR (55 × 85 mm, 9 pcs)
  const verticalData: VerticalCardProps = {
    title: 'Лавка здоровья и красоты',
    address1: 'Ул. Ленина, д. 3,',
    address2: 'ост. «Горячий Хлеб»',
    hours: 'С 11 до 20 Без выходных',
    phone: '8-926-397-33-23',
    tgUrl: 'https://t.me/avon_lytkarino',
  };

  const TOTAL_COMPACT = 24; // 3 columns × 8 rows
  const TOTAL_VERTICAL = 9; // 3 columns × 3 rows

  const compactCards = Array.from({ length: TOTAL_COMPACT }, () => ({ ...compactData }));
  const verticalCards = Array.from({ length: TOTAL_VERTICAL }, () => ({ ...verticalData }));

  return (
    <main className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-6 print:hidden">
        <Breadcrumbs items={[{ label: 'Визитные карточки' }]} />

        {/* Format Selector Tabs */}
        <div className="mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Выберите формат визиток
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCardType('compact')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                cardType === 'compact'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg text-xl ${
                  cardType === 'compact' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <HiOutlineSparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Компактная (24 шт.)</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Максимум на A4
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  65 × 35 мм • С именем «Анна» • Тел: 8-995-558-29-13 • Без QR
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCardType('vertical')}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                cardType === 'vertical'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div
                className={`p-2.5 rounded-lg text-xl ${
                  cardType === 'vertical' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <HiOutlineIdentification className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">Вертикальная (9 шт.)</span>
                  <span className="text-[11px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-full">
                    Классическая
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  55 × 85 мм • С QR-кодом Telegram • Тел: 8-926-397-33-23
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: preview */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📇 Предварительный просмотр
              </h2>

              <div className="flex justify-center bg-gray-100 p-6 rounded-lg border border-dashed border-gray-300 overflow-auto min-h-[160px] items-center">
                {cardType === 'compact' ? (
                  <CompactBusinessCard {...compactData} />
                ) : (
                  <VerticalBusinessCard {...verticalData} />
                )}
              </div>

              <div className="mt-8 space-y-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <HiOutlinePrinter className="w-6 h-6" />
                  Печать визиток ({cardType === 'compact' ? `${TOTAL_COMPACT} шт.` : `${TOTAL_VERTICAL} шт.`})
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
              {cardType === 'compact' ? (
                <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                  <li>Формат: <strong>65 × 35 мм</strong> (горизонтальная, мини)</li>
                  <li>На листе A4: <strong>24 шт.</strong> (сетка 3 × 8)</li>
                  <li>Поля листа: 7.5 мм по бокам, 8.5 мм сверху/снизу</li>
                  <li>Телефон: <strong>8-995-558-29-13</strong></li>
                  <li>Контакт: <strong>Анна</strong></li>
                  <li>Бумага: 160–300 г/м² (подходит плотная бумага для визиток или картон)</li>
                </ul>
              ) : (
                <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                  <li>Формат: <strong>55 × 85 мм</strong> (вертикальная)</li>
                  <li>На листе A4: <strong>9 шт.</strong> (сетка 3 × 3)</li>
                  <li>Поля листа: 10 мм по периметру</li>
                  <li>Элементы: QR-код для перехода в Telegram</li>
                  <li>Телефон: <strong>8-926-397-33-23</strong></li>
                  <li>Бумага: 200–300 г/м²</li>
                </ul>
              )}
            </div>
          </div>

          {/* Right: page mock */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Макет листа A4
              </h2>
              <p className="text-gray-600 mb-4">
                {cardType === 'compact'
                  ? `Печать: ${TOTAL_COMPACT} визитки (3 × 8), плотная раскладка с общими линиями реза.`
                  : `Печать: ${TOTAL_VERTICAL} визиток (3 × 3), классическая раскладка с общими линиями реза.`}
              </p>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center overflow-auto max-h-[720px]">
                {cardType === 'compact' ? (
                  <div className="scale-[0.42] sm:scale-[0.52] origin-top transform my-2">
                    <div className="bg-white p-[8.5mm_7.5mm] shadow-2xl border border-gray-300">
                      <div className="grid grid-cols-3 gap-0">
                        {compactCards.map((c, idx) => (
                          <div
                            key={idx}
                            className={[
                              'border-black border-t border-l',
                              (idx + 1) % 3 === 0 ? 'border-r' : '',
                              idx >= 21 ? 'border-b' : '',
                            ].join(' ')}
                          >
                            <CompactBusinessCard {...c} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="scale-50 origin-top transform my-2">
                    <div className="bg-white p-[10mm] shadow-2xl border border-gray-300">
                      <div className="grid grid-cols-3 gap-0">
                        {verticalCards.map((c, idx) => (
                          <div
                            key={idx}
                            className={[
                              'border-black border-t border-l',
                              (idx + 1) % 3 === 0 ? 'border-r' : '',
                              idx >= 6 ? 'border-b' : '',
                            ].join(' ')}
                          >
                            <VerticalBusinessCard {...c} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-500">
                Совет для печати: в окне печати браузера установите масштаб <strong>100%</strong> (отключите «По размеру страницы / Fit to page»), чтобы размеры карточек в миллиметрах соответствовали макету.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only grids (no gaps, single shared border lines between cards) */}
      <div className="hidden print:block">
        {cardType === 'compact' ? (
          <div className="print-grid-compact">
            {compactCards.map((c, idx) => (
              <div
                key={idx}
                className={[
                  'card-wrap',
                  'border-black border-t border-l',
                  (idx + 1) % 3 === 0 ? 'border-r' : '',
                  idx >= 21 ? 'border-b' : '',
                ].join(' ')}
              >
                <CompactBusinessCard {...c} />
              </div>
            ))}
          </div>
        ) : (
          <div className="print-grid-vertical">
            {verticalCards.map((c, idx) => (
              <div
                key={idx}
                className={[
                  'card-wrap',
                  'border-black border-t border-l',
                  (idx + 1) % 3 === 0 ? 'border-r' : '',
                  idx >= 6 ? 'border-b' : '',
                ].join(' ')}
              >
                <VerticalBusinessCard {...c} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: ${cardType === 'compact' ? '8.5mm 7.5mm' : '10mm'};
        }

        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }

          .print-grid-compact {
            display: grid !important;
            grid-template-columns: repeat(3, 65mm);
            grid-template-rows: repeat(8, 35mm);
            gap: 0 !important;
            justify-content: center;
            align-content: start;
          }

          .print-grid-vertical {
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
            box-sizing: border-box;
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
