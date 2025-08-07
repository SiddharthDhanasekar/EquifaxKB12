import React from 'react';
import { 
  MessageCircle, 
  FileText, 
  Database, 
  Globe, 
  Key, 
  Shield 
} from 'lucide-react';
import { TabType, ConfluenceArticle } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedArticles: ConfluenceArticle[];
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  selectedArticles 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col h-32 py-4">
          {/* Top row - Brand */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4 min-w-0">
              <Shield className="h-10 w-10 text-red-600 flex-shrink-0" />
              <div className="min-w-0 text-center">
                <h1 className="text-2xl font-semibold text-gray-900">Equifax Knowledge Base</h1>
                <p className="text-sm text-gray-500">AI-Powered Information System</p>
              </div>
            </div>
          </div>
          
          {/* Bottom row - Navigation */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setActiveTab('qa')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'qa'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline-block mr-2" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('article')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'article'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Article Reader
            </button>
            <button
              onClick={() => setActiveTab('confluence')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'confluence'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4 inline-block mr-2" />
              Confluence API
            </button>
            <button
              onClick={() => setActiveTab('direct-confluence')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'direct-confluence'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4 inline-block mr-2" />
              Direct Access
            </button>
            <button
              onClick={() => setActiveTab('selected-articles')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'selected-articles'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Selected Articles
              {selectedArticles.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {selectedArticles.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('gemini-config')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gemini-config'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Key className="w-4 h-4 inline-block mr-2" />
              Gemini Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 