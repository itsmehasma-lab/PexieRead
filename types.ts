
export interface AnalysisResult {
  id: string;
  imageUrl: string;
  extractedText: string;
  category: string;
  language: string;
  rawResponse: string;
  chatHistory?: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}