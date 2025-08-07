export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface QuestionData {
  title: string;
  details: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string;
  deadline: string;
}

export interface ArticleData {
  url: string;
  title: string;
  content: string;
}

export interface ConfluenceCredentials {
  username: string;
  apiKey: string;
}

export interface ConfluenceArticle {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  author: string;
  space: string;
  url: string;
}

export type TabType = 'qa' | 'article' | 'confluence' | 'direct-confluence' | 'selected-articles' | 'gemini-config'; 