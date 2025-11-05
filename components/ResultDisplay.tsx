import React, { useState, useRef } from 'react';
// Fix: Added .ts extension to fix module resolution error.
import type { AnalysisResult } from '../types.ts';
// Fix: Added .tsx extension to fix module resolution error.
import { TagIcon, DocumentTextIcon, ClipboardIcon, CheckIcon, DownloadIcon, LanguageIcon, ChatBubbleBottomCenterTextIcon } from './icons.tsx';

interface ResultDisplayProps {
  result: AnalysisResult;
  onTextSelectForChat: (text: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onTextSelectForChat }) => {
  const charCount = result.extractedText ? result.extractedText.length : 0;
  const [isCopied, setIsCopied] = useState(false);
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopyText = () => {
    if (!result.extractedText) return;
    navigator.clipboard.writeText(result.extractedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const handleDownloadText = () => {
    if (!result.extractedText) return;

    const blob = new Blob([result.extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMouseUp = () => {
    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();

    if (selectedText && preRef.current) {
        const range = selectionObj.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = preRef.current.getBoundingClientRect();

        setSelection({
            text: selectedText,
            top: rect.top - containerRect.top - 45, // Position above selection
            left: rect.left - containerRect.left + (rect.width / 2), // Center horizontally
        });
    } else {
        setSelection(null);
    }
  };

  const handleAskAboutSelection = () => {
    if (selection) {
        onTextSelectForChat(selection.text);
        setSelection(null); // Hide popover after click
        window.getSelection()?.removeAllRanges(); // Clear the browser selection
    }
  };


  return (
    <div className="w-full p-6 space-y-6 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h3 className="flex items-center text-xl font-semibold text-gray-200 tracking-wide mb-2">
            <TagIcon className="w-6 h-6 mr-3 text-blue-400" />
            Category
            </h3>
            <p className="px-3 py-2 text-lg text-blue-300 bg-white/5 rounded-md truncate">{result.category}</p>
        </div>
        <div>
            <h3 className="flex items-center text-xl font-semibold text-gray-200 tracking-wide mb-2">
            <LanguageIcon className="w-6 h-6 mr-3 text-green-400" />
            Language
            </h3>
            <p className="px-3 py-2 text-lg text-green-300 bg-white/5 rounded-md truncate">{result.language}</p>
        </div>
      </div>


      <div>
        <h3 className="flex items-center justify-between text-xl font-semibold text-gray-200 tracking-wide mb-2">
            <div className="flex items-center">
                <DocumentTextIcon className="w-6 h-6 mr-3 text-blue-400" />
                <span>Extracted Text</span>
            </div>
            <div className="flex items-center space-x-2">
                {charCount > 0 && (
                  <>
                    <button
                        onClick={handleDownloadText}
                        className="flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-300 bg-white/10 rounded-md hover:bg-white/20 transition-all duration-200"
                        title="Save extracted text to a .txt file"
                    >
                        <DownloadIcon className="w-4 h-4 mr-1.5" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleCopyText}
                        className="flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-300 bg-white/10 rounded-md hover:bg-white/20 transition-all duration-200 disabled:bg-green-500/20 disabled:text-green-300"
                        disabled={isCopied}
                        aria-live="polite"
                        title="Copy extracted text to clipboard"
                    >
                        {isCopied ? (
                            <>
                                <CheckIcon className="w-4 h-4 mr-1.5" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <ClipboardIcon className="w-4 h-4 mr-1.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                  </>
                )}
                {charCount > 0 && (
                    <span className="text-sm font-normal text-gray-400 bg-white/10 px-2 py-1 rounded-md">
                        {charCount} characters
                    </span>
                )}
            </div>
        </h3>
        <div className="relative">
            {selection && (
                <button
                    style={{ top: `${selection.top}px`, left: `${selection.left}px` }}
                    onClick={handleAskAboutSelection}
                    className="absolute z-10 flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-gray-900 border border-blue-500 rounded-lg shadow-lg -translate-x-1/2 animate-fade-in-down"
                >
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-400" />
                    Ask about selected
                </button>
            )}
            <pre
                ref={preRef}
                onMouseUp={handleMouseUp}
                className="p-4 text-sm whitespace-pre-wrap bg-white/5 rounded-md max-h-80 overflow-y-auto text-gray-300 font-mono"
            >
                <code>
                    {result.extractedText || "No text could be extracted."}
                </code>
            </pre>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;