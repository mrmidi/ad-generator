import React from 'react';
import {
  IoArrowUp,
  IoArrowDown,
  IoArrowBack,
  IoArrowForward,
} from 'react-icons/io5';
import type { AppState } from '@/app/state';

interface ArrowToolbarProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export default function ArrowToolbar({ state, setState }: ArrowToolbarProps) {
  const insertArrow = (arrow: string) => {
    const newContent = state.editorContent + arrow;
    setState({
      ...state,
      editorContent: newContent,
    });
  };

  const arrowButtons = [
    {
      symbol: '↑',
      icon: IoArrowUp,
      label: 'Insert up arrow',
      ariaLabel: 'Insert up arrow',
    },
    {
      symbol: '↓',
      icon: IoArrowDown,
      label: 'Insert down arrow',
      ariaLabel: 'Insert down arrow',
    },
    {
      symbol: '←',
      icon: IoArrowBack,
      label: 'Insert left arrow',
      ariaLabel: 'Insert left arrow',
    },
    {
      symbol: '→',
      icon: IoArrowForward,
      label: 'Insert right arrow',
      ariaLabel: 'Insert right arrow',
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Arrow symbols toolbar"
      className="flex gap-2 p-2 bg-gray-50 rounded-lg border"
    >
      {arrowButtons.map(({ symbol, icon: Icon, label, ariaLabel }) => (
        <button
          key={symbol}
          onClick={() => insertArrow(symbol)}
          aria-label={ariaLabel}
          title={label}
          tabIndex={0}
          className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center"
        >
          <Icon className="w-4 h-4 text-gray-700" />
        </button>
      ))}
    </div>
  );
}
