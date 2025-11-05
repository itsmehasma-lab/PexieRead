
import React, { useState, useEffect } from 'react';
// Fix: Added file extensions to component and service imports to resolve module errors.
import ImageUploader from './components/ImageUploader.tsx';
import ResultDisplay from './components/ResultDisplay.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import HistoryPanel from './components/HistoryPanel.tsx';
import BatchResultsDisplay from './components/BatchResultsDisplay.tsx';
import { analyzeImage, startChatSession, sendChatMessage } from './services/geminiService.ts';
import type { AnalysisResult, ChatMessage } from './types.ts';
import { SpinnerIcon } from './components/icons.tsx';

const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [currentBatchResults, setCurrentBatchResults] = useState<AnalysisResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    try {
      const savedHistory = localStorage.getItem('analysisHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(history));
  }, [history]);

  const resetState = () => {
    setImageUrl(null);
    setActiveResult(null);
    setCurrentBatchResults([]);
    setChatMessages([]);
    setError(null);
    setIsLoading(false);
    setIsChatLoading(false);
  };

  const handleImageSelect = async (files: File[]) => {
    if (!files || files.length === 0) return;

    resetState();
    setIsLoading(true);
    
    const newResults: AnalysisResult[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileObjectURL = URL.createObjectURL(file);
        setLoadingMessage(`Analyzing image ${i + 1} of ${files.length}...`);
        setImageUrl(fileObjectURL); // Show the image being processed

        try {
            const result = await analyzeImage(file);
            const newResult: AnalysisResult = {
                id: new Date().toISOString() + `-${i}`,
                imageUrl: fileObjectURL,
                ...result,
                chatHistory: []
            };
            newResults.push(newResult);
            // Show intermediate result
            setActiveResult(newResult);
        } catch (e) {
            console.error(e);
            setError(`An error occurred while analyzing "${file.name}". Stopping batch process.`);
            break; // Stop on error
        }
    }

    if (newResults.length > 0) {
        // Add all new results to history
        setHistory(prev => [...newResults.reverse(), ...prev].slice(0, 10));
        
        // Update state with batch results
        setCurrentBatchResults(newResults);

        // Set the last successful result as the active one and initialize chat
        const lastResult = newResults[newResults.length - 1];
        setActiveResult(lastResult);
        setImageUrl(lastResult.imageUrl);
        setChatMessages(lastResult.chatHistory || []);
        startChatSession(lastResult);
    }

    setIsLoading(false);
    setLoadingMessage(null);
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    const currentMessages = [...chatMessages, userMessage];
    setChatMessages(currentMessages);
    setIsChatLoading(true);

    try {
      const modelResponse = await sendChatMessage(message);
      const modelMessage: ChatMessage = { role: 'model', content: modelResponse };
      const finalMessages = [...currentMessages, modelMessage];
      setChatMessages(finalMessages);

      // Save chat to history and current batch
      if (activeResult) {
        const updatedResult = { ...activeResult, chatHistory: finalMessages };
        setActiveResult(updatedResult);
        setHistory(prev => prev.map(h => h.id === updatedResult.id ? updatedResult : h));
        setCurrentBatchResults(prev => prev.map(r => r.id === updatedResult.id ? updatedResult : r));
      }

    } catch (e) {
      console.error(e);
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I couldn't get a response. Please try again." };
      const finalMessages = [...currentMessages, errorMessage];
      setChatMessages(finalMessages);
      
      // Save chat to history even on error
      if (activeResult) {
        const updatedResult = { ...activeResult, chatHistory: finalMessages };
        setActiveResult(updatedResult);
        setHistory(prev => prev.map(h => h.id === updatedResult.id ? updatedResult : h));
        setCurrentBatchResults(prev => prev.map(r => r.id === updatedResult.id ? updatedResult : r));
      }

    } finally {
      setIsChatLoading(false);
    }
  };
  
  const handleSelectHistory = (result: AnalysisResult) => {
      // Don't reset state completely, just load the selected one
      setError(null);
      setIsLoading(false);
      setIsChatLoading(false);
      setCurrentBatchResults([]); // Clear batch view

      setActiveResult(result);
      setImageUrl(result.imageUrl);
      setChatMessages(result.chatHistory || []); // Load chat history
      startChatSession(result);
  };
  
  const handleSelectBatchItem = (result: AnalysisResult) => {
    setActiveResult(result);
    setImageUrl(result.imageUrl);
    setChatMessages(result.chatHistory || []);
    startChatSession(result);
  };

  const handleClearHistory = () => {
      setHistory([]);
  };

  const handleTextSelectForChat = (selectedText: string) => {
    setChatPrompt(`Tell me more about "${selectedText}"`);
    // Scroll to the chat interface for a smoother user experience
    document.getElementById('chat-interface')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-50 font-sans p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto max-w-7xl">
        <header className="text-center my-8 animate-fade-in-down">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            PexieReader
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Upload an image to extract, classify, and understand its text.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          
          {/* Main Content */}
          <section className="lg:col-span-2 space-y-8">
            <ImageUploader 
              onImageSelect={handleImageSelect} 
              imageUrl={imageUrl} 
              onClearImage={resetState}
            />

            {isLoading && (
              <div className="flex justify-center items-center space-x-3 text-lg text-gray-300 p-8">
                <SpinnerIcon className="w-8 h-8 animate-spin text-blue-400" />
                <span>{loadingMessage || 'Analyzing image...'}</span>
              </div>
            )}

            {error && <p className="text-center text-red-400 bg-red-500/20 p-3 rounded-lg">{error}</p>}
            
            {currentBatchResults.length > 1 && activeResult && (
              <BatchResultsDisplay
                results={currentBatchResults}
                activeResultId={activeResult.id}
                onSelectResult={handleSelectBatchItem}
              />
            )}

            {activeResult && (
              <>
                <ResultDisplay 
                  result={activeResult} 
                  onTextSelectForChat={handleTextSelectForChat}
                />
                <ChatInterface
                  id="chat-interface"
                  messages={chatMessages} 
                  onSendMessage={handleSendMessage} 
                  isLoading={isChatLoading}
                  initialPrompt={chatPrompt}
                  onPromptUsed={() => setChatPrompt(null)}
                />
              </>
            )}
          </section>

          {/* History Sidebar */}
          <aside className="lg:col-span-1 mt-8 lg:mt-0">
            <HistoryPanel 
              history={history} 
              onSelect={handleSelectHistory} 
              onClear={handleClearHistory} 
            />
          </aside>
          
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12 pb-4">
            <p>Powered by Google Gemini</p>
        </footer>
      </main>
    </div>
  );
};

export default App;