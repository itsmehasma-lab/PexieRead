import React, { useState, useMemo } from 'react';
import type { AnalysisResult } from '../types.ts';
import { TagIcon, SortAscendingIcon } from './icons.tsx';

interface BatchResultsDisplayProps {
  results: AnalysisResult[];
  activeResultId: string | null;
  onSelectResult: (result: AnalysisResult) => void;
}

const BatchResultsDisplay: React.FC<BatchResultsDisplayProps> = ({ results, activeResultId, onSelectResult }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSorted, setIsSorted] = useState(false);

  const categories = ['All', 'Digits only', 'Alphabets only', 'Alphanumeric'];

  const displayedResults = useMemo(() => {
    let filtered = results;

    if (activeFilter !== 'All') {
      filtered = results.filter(r => r.category === activeFilter);
    }

    if (isSorted) {
      return [...filtered].sort((a, b) => a.category.localeCompare(b.category));
    }

    return filtered;
  }, [results, activeFilter, isSorted]);

  return (
    <div className="w-full p-4 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-200 tracking-wide">
          Batch Results ({results.length} images)
        </h3>
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white/5 rounded-lg p-1 space-x-1">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveFilter(category)}
                        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                            activeFilter === category ? 'bg-blue-500 text-white shadow' : 'text-gray-300 hover:bg-white/10'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <button
                onClick={() => setIsSorted(!isSorted)}
                title={isSorted ? "Remove sorting" : "Sort A-Z by Category"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 ${
                    isSorted ? 'bg-blue-500 text-white shadow' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
            >
                <SortAscendingIcon className="w-4 h-4" />
                <span>Sort</span>
            </button>
        </div>
      </div>

      {displayedResults.length > 0 ? (
        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
          {displayedResults.map((result) => (
            <button
              key={result.id}
              onClick={() => onSelectResult(result)}
              className={`flex-shrink-0 w-36 p-2 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500
                ${activeResultId === result.id ? 'border-blue-500 bg-blue-500/20' : 'border-transparent hover:bg-white/10'}`}
            >
              <img src={result.imageUrl} alt="Batch thumbnail" className="w-full h-20 object-cover rounded-md mb-2" />
              <div className="text-xs text-left">
                <p className="flex items-center text-gray-300">
                  <TagIcon className="w-3 h-3 mr-1.5 flex-shrink-0 text-blue-400" />
                  <span className="truncate">{result.category}</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
            <p>No results match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default BatchResultsDisplay;