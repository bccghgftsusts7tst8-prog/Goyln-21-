
export enum ModelType {
  FAST = 'FAST',
  THINKER = 'THINKER'
}

export enum ProviderType {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  attachments?: string[];
}

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
}
