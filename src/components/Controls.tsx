import { AppState } from '@/app/state';
import { iframePrint } from '@/utils/iframePrint';

interface ControlsProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export default function Controls({ state, setState }: ControlsProps) {
  const handlePrint = async () => {
    await iframePrint({
      paperFormat: state.paperFormat,
      editorContent: state.editorContent
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <label className="text-sm font-medium text-yellow-800" htmlFor="debugModeToggle">
          🔧 Debug Mode
        </label>
        <input
          className="h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
          type="checkbox"
          id="debugModeToggle"
          checked={state.debugMode}
          onChange={() => setState({ ...state, debugMode: !state.debugMode })}
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Ориентация бумаги:
        </label>
        <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              state.paperFormat === 'a4-portrait'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setState({ ...state, paperFormat: 'a4-portrait' })}
          >
            📄 Портрет
          </button>
          <button
            type="button"
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              state.paperFormat === 'a4-landscape'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setState({ ...state, paperFormat: 'a4-landscape' })}
          >
            📄 Ландшафт
          </button>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-2">
          📝 Размер шрифта: <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-mono">{state.fontSize}px</span>
        </label>
        <input
          type="range"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          min="10"
          max="100"
          id="fontSize"
          value={state.fontSize}
          onChange={(e) =>
            setState({ ...state, fontSize: parseInt(e.target.value) })
          }
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10px</span>
          <span>100px</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <label htmlFor="verticalPosition" className="block text-sm font-medium text-gray-700 mb-2">
          ↕️ Позиция по вертикали: <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-mono">{state.verticalPosition}%</span>
        </label>
        <input
          type="range"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          min="0"
          max="100"
          id="verticalPosition"
          value={state.verticalPosition}
          onChange={(e) =>
            setState({ ...state, verticalPosition: parseInt(e.target.value) })
          }
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Верх</span>
          <span>Центр</span>
          <span>Низ</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <button 
          id="printButton" 
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
          onClick={handlePrint}
        >
          🖨️ Печать
        </button>
      </div>
    </div>
  );
}