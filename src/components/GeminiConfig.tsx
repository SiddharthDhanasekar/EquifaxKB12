import React from 'react';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';
import { validateApiKey } from '../utils/gemini';

interface GeminiConfigProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

export const GeminiConfig: React.FC<GeminiConfigProps> = ({ 
  geminiApiKey, 
  setGeminiApiKey 
}) => {
  const handleTestKey = async () => {
    if (!validateApiKey(geminiApiKey)) {
      alert('❌ Invalid API key format. API key should start with "AIza" and be at least 30 characters long.');
      return;
    }
    
    console.log('Testing API key:', geminiApiKey.substring(0, 10) + '...');
    
    const testQuery = (document.getElementById('test-query') as HTMLInputElement)?.value || 'hello';
    
    try {
      const requestBody = {
        contents: [{ 
          parts: [{ text: testQuery }] 
        }],
        generationConfig: { 
          maxOutputTokens: 50,
          temperature: 0.1
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          alert('✅ API key is working correctly!');
        } else {
          alert('❌ API response format error. Please check your key.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
        if (response.status === 400) {
          alert('❌ Invalid API key. Please check your key format.');
        } else if (response.status === 403) {
          alert('❌ API key is invalid or has no permissions. Please check your key.');
        } else if (response.status === 503) {
          alert('⚠️ Gemini API service is temporarily unavailable (503). This is a Google server issue, not your API key. Please try again in a few minutes.');
        } else {
          alert(`❌ API key test failed (${response.status}). Please check your key.`);
        }
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('❌ Network error. Please check your internet connection and API key.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            <Key className="w-5 h-5 inline-block mr-2 text-red-600" />
            Gemini API Configuration
          </h2>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">API Key Management</p>
              <p>Configure your Gemini API key to enable AI-powered responses in the Knowledge Base. The API key is used to generate intelligent responses to your queries.</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 mb-2">
              Gemini API Key
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                id="gemini-api-key"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your Gemini API key"
              />
              <button
                type="button"
                onClick={() => setGeminiApiKey('AIzaSyD45vI0L4mG3tguO_srvmWqSbAvyCdsOqo')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Reset to Default
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally and used for all Gemini API calls.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Test API Connection</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter a test query (e.g., 'hello')"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                id="test-query"
              />
              <button
                type="button"
                onClick={handleTestKey}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Test Key
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div className="text-sm text-green-800">
                <p className="font-medium">API Key Configured</p>
                <p>Your Gemini API key is ready to use. You can now use the Knowledge Base tab to ask questions.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 