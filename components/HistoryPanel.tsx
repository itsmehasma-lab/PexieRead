import React from 'react';
// Fix: Added .ts extension to fix module resolution error.
import type { AnalysisResult } from '../types.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { HistoryIcon, TrashIcon } from './icons.tsx';

interface HistoryPanelProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
  return (
    <div className="w-full p-6 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-xl font-semibold text-gray-200 tracking-wide">
          <HistoryIcon className="w-6 h-6 mr-3" />
          <span>History</span>
        </div>
        {history.length > 0 && (
            <button
            onClick={onClear}
            className="flex items-center px-3 py-1.5 text-sm text-red-300 bg-red-500/20 rounded-md hover:bg-red-500/40 transition-colors"
            aria-label="Clear history"
            >
            <TrashIcon className="w-4 h-4 mr-2" />
            Clear
            </button>
        )}
      </div>
      {history.length > 0 ? (
        <ul className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {history.map((item) => (
            <li key={item.id}>
                <button
                onClick={() => onSelect(item)}
                className="w-full flex items-center p-2 text-left bg-white/5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <img src={item.imageUrl} alt="History thumbnail" className="w-12 h-12 object-cover rounded-md mr-4 flex-shrink-0" />
                <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-semibold text-gray-50 truncate">{item.extractedText || 'No text found'}</p>
                    <p className="text-xs text-gray-400">{item.category}</p>
                </div>
                </button>
            </li>
            ))}
        </ul>
      ) : (
        <div className="text-center py-12 text-gray-500">
            <p>Your analysis history will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;