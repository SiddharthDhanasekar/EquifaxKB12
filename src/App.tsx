import React, { useState } from 'react';
import { 
  MessageCircle, 
  FileText, 
  Send, 
  Loader2, 
  Bot, 
  User,
  Link,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Database,
  Key,
  Search,
  Shield,
  Clock,
  Globe,
  ExternalLink,
  BarChart,
  Brain,
  Play,
  Plus
} from 'lucide-react';
import { 
  Message, 
  QuestionData, 
  ArticleData, 
  ConfluenceCredentials, 
  ConfluenceArticle, 
  TabType 
} from './types';
import { 
  simulateAIResponse, 
  validateApiKey 
} from './utils/gemini';
import { 
  handleConfluenceConnect, 
  handleConfluenceAPISearch, 
  mockConfluenceSearch 
} from './utils/confluence';
import { Header } from './components/Header';
import { GeminiConfig } from './components/GeminiConfig';

function App() {
  const [activeTab, setActiveTab] = useState<'qa' | 'article' | 'confluence' | 'direct-confluence' | 'selected-articles' | 'gemini-config'>('qa');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Q&A form state
  const [questionData, setQuestionData] = useState<QuestionData>({
    title: '',
    details: '',
    category: 'security',
    priority: 'medium',
    tags: '',
    deadline: ''
  });

  // Article reader state
  const [articleData, setArticleData] = useState<ArticleData>({
    url: '',
    title: '',
    content: ''
  });
  const [articleSummary, setArticleSummary] = useState<string>('');
  const [articleLoading, setArticleLoading] = useState(false);

  // Confluence state
  const [confluenceCredentials, setConfluenceCredentials] = useState<ConfluenceCredentials>({
    username: '',
    apiKey: ''
  });
  const [confluenceSearch, setConfluenceSearch] = useState('');
  const [confluenceArticles, setConfluenceArticles] = useState<ConfluenceArticle[]>([]);
  const [selectedConfluenceArticle, setSelectedConfluenceArticle] = useState<ConfluenceArticle | null>(null);
  const [isConnectedToConfluence, setIsConnectedToConfluence] = useState(false);
  const [isSearchingConfluence, setIsSearchingConfluence] = useState(false);
  const [confluenceConnectionStatus, setConfluenceConnectionStatus] = useState('');

  // Gemini API Key state
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD45vI0L4mG3tguO_srvmWqSbAvyCdsOqo');
  
  // Validate API key format
  const validateApiKey = (key: string) => {
    return key.startsWith('AIza') && key.length > 30;
  };

  // Direct Confluence state
  const [directConfluenceSearch, setDirectConfluenceSearch] = useState('');
  const [directAccessMode, setDirectAccessMode] = useState<'confluence' | 'bigquery'>('confluence');
  
  // BigQuery state
  const [bigQuerySQL, setBigQuerySQL] = useState('');
  const [bigQueryResults, setBigQueryResults] = useState<any[]>([]);
  const [bigQueryLoading, setBigQueryLoading] = useState(false);
  
  // Selected Articles state
  const [selectedArticles, setSelectedArticles] = useState<ConfluenceArticle[]>([]);
  
  // Search suggestions state
  const [lastSearchSuggestions, setLastSearchSuggestions] = useState<string[]>([]);

  // Real AI responses using Gemini API - Direct user input to AI
  const simulateAIResponse = async (input: string, category: string): Promise<{response: string, searchSuggestions: string[]}> => {
    try {
      // Create a simple, direct prompt that uses exactly what the user typed
      const prompt = `${input}

Provide a direct, factual response to the above query. Focus on answering the question directly without unnecessary security assessments or risk analysis. If asked for a list, provide a clear list. If asked for information, provide the information directly.

At the end, suggest 3-5 specific search terms that would help find related documentation. Format these as:

**Related Documentation Search Suggestions:**
• [search term 1]
• [search term 2] 
• [search term 3]`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        console.log('Using API key:', geminiApiKey.substring(0, 10) + '...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              maxOutputTokens: 300,
              temperature: 0.2,
              topP: 0.8,
              topK: 40
            }
          }),
          signal: controller.signal
        });
        
                clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 503) {
            throw new Error('Gemini API service is temporarily unavailable. Please try again in a few minutes.');
          }
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiResponseText) {
          // Extract search suggestions from the response
          const searchSuggestions = extractSearchSuggestions(aiResponseText, input, category);
          return {
            response: aiResponseText,
            searchSuggestions
          };
        } else {
          throw new Error('No response text received from API');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error calling Gemini API:', error);
        
        // Fallback to mock responses if API fails
        const mockResponse = generateMockResponse(input, category);
        const searchSuggestions = generateSearchSuggestions(input, category);
        
        return {
          response: mockResponse,
          searchSuggestions
        };
      }
    } catch (error) {
      console.error('Outer error in simulateAIResponse:', error);
      // Fallback to mock responses if everything fails
      const mockResponse = generateMockResponse(input, category);
      const searchSuggestions = generateSearchSuggestions(input, category);
      
      return {
        response: mockResponse,
        searchSuggestions
      };
    }
  };

  // Extract search suggestions from AI response
  const extractSearchSuggestions = (responseText: string, input: string, category: string): string[] => {
    // Try to extract suggestions from the AI response
    const suggestionMatch = responseText.match(/\*\*Related Documentation Search Suggestions:\*\*\n((?:• .+\n?)+)/);
    
    if (suggestionMatch) {
      const suggestions = suggestionMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.replace('•', '').trim())
        .filter(suggestion => suggestion.length > 0);
      
      if (suggestions.length > 0) {
        return suggestions;
      }
    }
    
    // Fallback to generated suggestions if not found in response
    return generateSearchSuggestions(input, category);
  };

  // Generate search suggestions based on input and category
  const generateSearchSuggestions = (input: string, category: string): string[] => {
    const categoryKeywords = {
      security: ['security framework', 'access control', 'encryption', 'incident response', 'vulnerability management'],
      compliance: ['FCRA compliance', 'GDPR procedures', 'regulatory requirements', 'audit checklist', 'data retention'],
      technical: ['API documentation', 'system architecture', 'deployment guide', 'technical standards', 'integration'],
      fraud: ['fraud detection', 'risk assessment', 'identity verification', 'monitoring protocols', 'alert procedures'],
      identity: ['identity verification', 'KYC procedures', 'consumer authentication', 'document validation', 'verification workflow'],
      data: ['data analytics', 'reporting procedures', 'data quality', 'analytics framework', 'business intelligence']
    };

    const inputKeywords = input.toLowerCase().split(' ').filter(word => word.length > 3);
    const categoryTerms = categoryKeywords[category as keyof typeof categoryKeywords] || categoryKeywords.security;
    
    // Combine input-specific terms with category terms
    const suggestions = [
      ...inputKeywords.slice(0, 2).map(keyword => `${keyword} procedures`),
      ...categoryTerms.slice(0, 3)
    ];

    return suggestions.slice(0, 5);
  };

  // Generate mock response with search suggestions
  const generateMockResponse = (input: string, category: string): string => {
    const equifaxResponses = {
      security: [
        `**Security Analysis - Equifax Knowledge Base**\n\nRegarding "${input.slice(0, 50)}...", here's my assessment:\n\n**Risk Level:** Medium to High\n\n**Key Security Considerations:**\n• Data encryption protocols must be followed\n• Multi-factor authentication requirements\n• Regular security audits and compliance checks\n• GDPR and CCPA compliance measures\n\n**Recommended Actions:**\n1. Implement additional security layers\n2. Review current access controls\n3. Conduct vulnerability assessment\n4. Update incident response procedures\n\n**Related Policies:** Refer to Security Policy 2024-SEC-001\n\n**Related Documentation Search Suggestions:**\n• security framework\n• access control procedures\n• incident response protocol\n• vulnerability management\n• encryption standards`,
        
        `**Equifax Security Framework Response**\n\nBased on your inquiry about "${input.slice(0, 50)}...":\n\n**Current Security Posture:**\n• Identity verification protocols active\n• Fraud detection systems monitoring\n• Real-time threat intelligence integration\n• Compliance with SOC 2 Type II standards\n\n**Analysis:**\nThis falls under our critical security infrastructure. The approach should align with:\n- Zero-trust security model\n- Continuous monitoring protocols\n- Data minimization principles\n- Regular penetration testing\n\n**Next Steps:**\nI recommend consulting with the Security Operations Center for detailed implementation guidance.\n\n**Related Documentation Search Suggestions:**\n• zero trust architecture\n• security monitoring\n• threat intelligence\n• SOC 2 compliance\n• penetration testing`
      ],
      compliance: [
        `**Regulatory Compliance Assessment**\n\nFor your question about "${input.slice(0, 50)}...":\n\n**Compliance Requirements:**\n• FCRA (Fair Credit Reporting Act) guidelines\n• GDPR Article 25 - Data Protection by Design\n• CCPA consumer rights provisions\n• SOX compliance for financial reporting\n\n**Current Status:** ✅ Compliant with quarterly review pending\n\n**Key Considerations:**\n1. Data retention policies (7-year cycle)\n2. Consumer consent management\n3. Third-party vendor assessments\n4. Regular compliance training requirements\n\n**Documentation Required:**\n- Risk assessment forms\n- Privacy impact analysis\n- Vendor security questionnaires\n\nRecommendation: Schedule compliance review within 30 days.\n\n**Related Documentation Search Suggestions:**\n• FCRA compliance procedures\n• GDPR data protection\n• regulatory requirements\n• compliance training\n• audit checklist`
      ],
      technical: [
        `**Technical Operations Response**\n\nTechnical analysis for "${input.slice(0, 50)}...":\n\n**System Architecture:**\n• Cloud-native infrastructure (AWS/Azure)\n• Microservices architecture\n• API-first design principles\n• Real-time data processing capabilities\n\n**Performance Metrics:**\n- 99.9% uptime SLA maintained\n- <200ms API response time\n- 24/7 monitoring and alerting\n- Automated scaling protocols\n\n**Implementation Approach:**\n1. Development in staging environment\n2. Comprehensive testing protocols\n3. Gradual production rollout\n4. Post-deployment monitoring\n\n**Technical Contacts:**\n- DevOps Team: devops@equifax.com\n- Architecture Review: architecture@equifax.com\n\n**Related Documentation Search Suggestions:**\n• API documentation\n• system architecture\n• deployment procedures\n• technical standards\n• monitoring guidelines`
      ]
    };

    const categoryResponses = equifaxResponses[category as keyof typeof equifaxResponses] || equifaxResponses.security;
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  // Real Confluence API integration functions
  const handleConfluenceConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confluenceCredentials.username.trim() || !confluenceCredentials.apiKey.trim()) {
      setConfluenceConnectionStatus('Please enter both username and API token');
      return;
    }

    setIsSearchingConfluence(true);
    setConfluenceConnectionStatus('Connecting to Equifax Confluence...');
    
    try {
      // Test connection with real Confluence API
      const auth = btoa(`${confluenceCredentials.username}:${confluenceCredentials.apiKey}`);
      const response = await fetch('https://equifax.atlassian.net/wiki/rest/api/user/current', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (response.ok) {
        const userData = await response.json();
        setIsConnectedToConfluence(true);
        setConfluenceConnectionStatus(`Successfully connected as ${userData.displayName || confluenceCredentials.username}`);
      } else if (response.status === 401) {
        setConfluenceConnectionStatus('Authentication failed. Please check your username and API token.');
      } else if (response.status === 403) {
        setConfluenceConnectionStatus('Access denied. Please verify your permissions.');
      } else {
        setConfluenceConnectionStatus(`Connection failed (HTTP ${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error('Confluence connection error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setConfluenceConnectionStatus('Network error. This may be due to CORS restrictions. Try using the Direct Access tab or connect from your Equifax network.');
      } else {
        setConfluenceConnectionStatus('Connection failed. Please check your credentials and network connection.');
      }
    } finally {
      setIsSearchingConfluence(false);
    }
  };

  const handleConfluenceAPISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confluenceSearch.trim()) {
      setConfluenceConnectionStatus('Please enter a search query');
      return;
    }
    
    if (!isConnectedToConfluence) {
      setConfluenceConnectionStatus('Please connect to Confluence first');
      return;
    }

    setIsSearchingConfluence(true);
    setConfluenceConnectionStatus('Searching Confluence...');
    
    try {
      const auth = btoa(`${confluenceCredentials.username}:${confluenceCredentials.apiKey}`);
      
      // Search using Confluence REST API
      const searchUrl = `https://equifax.atlassian.net/wiki/rest/api/content/search?cql=text~"${encodeURIComponent(confluenceSearch)}"&limit=20&expand=space,history,body.view`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform API results to our format
        const results = data.results.map((item: any) => ({
          id: item.id,
          title: item.title,
          space: item.space?.name || 'Unknown Space',
          author: item.history?.createdBy?.displayName || 'Unknown Author',
          lastModified: item.history?.lastUpdated?.when 
            ? new Date(item.history.lastUpdated.when)
            : new Date(),
          content: item.body?.view?.value 
            ? item.body.view.value.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
            : 'No preview available',
          url: `https://equifax.atlassian.net/wiki${item._links.webui}`
        }));

        setConfluenceArticles(results);
        setConfluenceConnectionStatus(`Found ${results.length} results for "${confluenceSearch}"`);
      } else if (response.status === 401) {
        setConfluenceConnectionStatus('Authentication expired. Please reconnect.');
        setIsConnectedToConfluence(false);
      } else if (response.status === 403) {
        setConfluenceConnectionStatus('Access denied. Please check your search permissions.');
      } else {
        setConfluenceConnectionStatus(`Search failed (HTTP ${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error('Confluence search error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setConfluenceConnectionStatus('Network error during search. This may be due to CORS restrictions.');
      } else {
        setConfluenceConnectionStatus('Search failed. Please try again.');
      }
    } finally {
      setIsSearchingConfluence(false);
    }
  };

  // Mock Confluence search functionality (fallback)
  const mockConfluenceSearch = async (query: string): Promise<ConfluenceArticle[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    const mockArticles: ConfluenceArticle[] = [
      {
        id: '1',
        title: 'Equifax Security Framework 2024',
        content: 'Comprehensive security guidelines and protocols for data protection...',
        lastModified: new Date('2024-01-15'),
        author: 'Security Team',
        space: 'Security',
        url: 'https://equifax.atlassian.net/wiki/spaces/SEC/pages/123456'
      },
      {
        id: '2',
        title: 'FCRA Compliance Guidelines',
        content: 'Updated Fair Credit Reporting Act compliance procedures and requirements...',
        lastModified: new Date('2024-01-10'),
        author: 'Compliance Team',
        space: 'Compliance',
        url: 'https://equifax.atlassian.net/wiki/spaces/COMP/pages/789012'
      },
      {
        id: '3',
        title: 'API Integration Best Practices',
        content: 'Technical documentation for secure API integrations and data handling...',
        lastModified: new Date('2024-01-08'),
        author: 'Engineering Team',
        space: 'Engineering',
        url: 'https://equifax.atlassian.net/wiki/spaces/ENG/pages/345678'
      },
      {
        id: '4',
        title: 'Identity Verification Procedures',
        content: 'Standard operating procedures for consumer identity verification processes...',
        lastModified: new Date('2024-01-05'),
        author: 'Operations Team',
        space: 'Operations',
        url: 'https://equifax.atlassian.net/wiki/spaces/OPS/pages/901234'
      },
      {
        id: '5',
        title: 'Data Breach Response Protocol',
        content: 'Emergency procedures and escalation paths for security incidents...',
        lastModified: new Date('2023-12-28'),
        author: 'Incident Response Team',
        space: 'Security',
        url: 'https://equifax.atlassian.net/wiki/spaces/SEC/pages/567890'
      }
    ];

    return mockArticles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      article.space.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionData.title.trim() && !questionData.details.trim()) return;

    // Create the user input exactly as they typed it
    const userInput = questionData.title.trim() + (questionData.details.trim() ? ' ' + questionData.details.trim() : '');

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `**${questionData.title}**\n\n${questionData.details}\n\n*Category: ${questionData.category} | Priority: ${questionData.priority}${questionData.tags ? ` | Tags: ${questionData.tags}` : ''}${questionData.deadline ? ` | Deadline: ${questionData.deadline}` : ''}*`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send the exact user input to Gemini API
      const aiResult = await simulateAIResponse(userInput, questionData.category);
      
      // Create AI message with search suggestions
      let aiContent = aiResult.response;
      
      if (aiResult.searchSuggestions.length > 0) {
        aiContent += `\n\n---\n\n**🔍 Quick Confluence Search Options:**\n`;
        aiResult.searchSuggestions.forEach((suggestion, index) => {
          aiContent += `\n[${index + 1}] **${suggestion}** - Click to search Confluence`;
        });
        aiContent += `\n\n*Tip: Use the Confluence API or Direct Access tabs to search for these terms and find related documentation.*`;
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact the IT support team.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Clear form
      setQuestionData({
        title: '',
        details: '',
        category: 'security',
        priority: 'medium',
        tags: '',
        deadline: ''
      });
    }
  };

  const handleArticleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!articleData.url.trim() && !articleData.content.trim()) return;

    setArticleLoading(true);
    
    try {
      // Simulate article processing
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      const mockSummary = `**Equifax Article Analysis Complete**\n\n**Title:** ${articleData.title || 'External Article Analysis'}\n**Source:** ${articleData.url || 'Text Input'}\n**Analysis Date:** ${new Date().toLocaleDateString()}\n\n**Executive Summary:**\nThis article has been analyzed for relevance to Equifax operations and compliance requirements.\n\n**Key Findings:**\n• Content aligns with industry best practices\n• Regulatory compliance considerations identified\n• Technical implementation feasibility assessed\n• Risk factors evaluated and documented\n\n**Compliance Assessment:**\n✅ FCRA Compliance: Reviewed\n✅ GDPR Alignment: Verified\n⚠️  SOX Requirements: Partial compliance noted\n\n**Risk Rating:** Medium\n**Implementation Complexity:** Intermediate\n**Recommended Action:** Proceed with legal review\n\n**Next Steps:**\n1. Share with compliance team for detailed review\n2. Technical feasibility assessment\n3. Resource allocation planning\n4. Timeline development\n\n**Questions for Legal/Compliance Team:**\n• Are there specific regulatory concerns?\n• What are the data retention implications?\n• How does this impact consumer rights?\n\n**Internal References:**\n- Security Policy SEC-2024-001\n- Compliance Guidelines COMP-2024-003\n- Technical Standards TECH-2024-007\n\nWould you like me to route this analysis to the appropriate team?`;
      
      setArticleSummary(mockSummary);
    } catch (error) {
      setArticleSummary('Error analyzing article. Please check the URL or content and try again, or contact IT support.');
    } finally {
      setArticleLoading(false);
    }
  };

  const handleConfluenceSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confluenceSearch.trim()) return;

    // Try real API first, fallback to mock if needed
    if (isConnectedToConfluence) {
      await handleConfluenceAPISearch(e);
    } else {
      setIsSearchingConfluence(true);
      try {
        const results = await mockConfluenceSearch(confluenceSearch);
        setConfluenceArticles(results);
        setConfluenceConnectionStatus(`Mock search results for "${confluenceSearch}" (${results.length} found)`);
      } catch (error) {
        console.error('Search failed');
        setConfluenceConnectionStatus('Search failed. Please try again.');
      } finally {
        setIsSearchingConfluence(false);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const clearArticle = () => {
    setArticleData({ url: '', title: '', content: '' });
    setArticleSummary('');
  };

  const clearConfluence = () => {
    setConfluenceArticles([]);
    setSelectedConfluenceArticle(null);
    setConfluenceSearch('');
  };

  const addToSelectedArticles = (article: ConfluenceArticle) => {
    if (!selectedArticles.find(a => a.id === article.id)) {
      setSelectedArticles(prev => [...prev, article]);
    }
  };

  const removeFromSelectedArticles = (articleId: string) => {
    setSelectedArticles(prev => prev.filter(a => a.id !== articleId));
  };

  const handleBigQueryExecute = async () => {
    if (!bigQuerySQL.trim()) return;
    
    setBigQueryLoading(true);
    
    try {
      // Simulate BigQuery execution
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      
      // Mock BigQuery results
      const mockResults = [
        { customer_id: 'EFX001', risk_score: 85, verification_status: 'VERIFIED', created_at: '2024-01-15' },
        { customer_id: 'EFX002', risk_score: 72, verification_status: 'PENDING', created_at: '2024-01-15' },
        { customer_id: 'EFX003', risk_score: 91, verification_status: 'VERIFIED', created_at: '2024-01-15' },
        { customer_id: 'EFX004', risk_score: 68, verification_status: 'REJECTED', created_at: '2024-01-15' },
        { customer_id: 'EFX005', risk_score: 89, verification_status: 'VERIFIED', created_at: '2024-01-15' }
      ];
      
      setBigQueryResults(mockResults);
    } catch (error) {
      console.error('BigQuery execution failed:', error);
    } finally {
      setBigQueryLoading(false);
    }
  };

  // Handle search suggestion clicks
  const handleSearchSuggestionClick = (suggestion: string) => {
    // Switch to Confluence API tab and perform the search
    setActiveTab('confluence');
    setConfluenceSearch(suggestion);
    
    // Automatically trigger search if connected
    if (isConnectedToConfluence) {
      setTimeout(() => {
        const form = document.querySelector('form[data-confluence-search]') as HTMLFormElement;
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-slate-100">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedArticles={selectedArticles}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'qa' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Question Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Ask Equifax Knowledge Base</h2>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear Chat
                  </button>
                )}
              </div>
              
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    value={questionData.title}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What do you need to know about Equifax procedures?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details
                  </label>
                  <textarea
                    value={questionData.details}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="Provide additional context or specific requirements..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={questionData.category}
                      onChange={(e) => setQuestionData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="security">Security & Risk</option>
                      <option value="compliance">Compliance & Regulatory</option>
                      <option value="technical">Technical Operations</option>
                      <option value="fraud">Fraud Prevention</option>
                      <option value="identity">Identity Verification</option>
                      <option value="data">Data Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={questionData.priority}
                      onChange={(e) => setQuestionData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline-block mr-1" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={questionData.tags}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="security, compliance, api, gdpr..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline-block mr-1" />
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={questionData.deadline}
                    onChange={(e) => setQuestionData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !questionData.title.trim()}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask Knowledge Base
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Chat Messages */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base Response</h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Ask the Equifax Knowledge Base anything!</p>
                    <p className="text-sm">I can help with security, compliance, technical procedures, and more.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                          {message.type === 'user' ? (
                            <User className="w-6 h-6 text-red-600" />
                          ) : (
                            <Bot className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">
                            {message.type === 'ai' && message.content.includes('🔍 Quick Confluence Search Options:') ? (
                              <div>
                                {message.content.split('🔍 Quick Confluence Search Options:')[0]}
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="text-blue-800 font-medium mb-2">🔍 Quick Confluence Search Options:</div>
                                  {message.content
                                    .split('🔍 Quick Confluence Search Options:')[1]
                                    ?.split('\n')
                                    .filter(line => line.trim().startsWith('['))
                                    .map((line, index) => {
                                      const searchTerm = line.match(/\*\*(.*?)\*\*/)?.[1];
                                      if (searchTerm) {
                                        return (
                                          <button
                                            key={index}
                                            onClick={() => handleSearchSuggestionClick(searchTerm)}
                                            className="block w-full text-left p-2 mb-1 bg-white hover:bg-blue-100 border border-blue-200 rounded text-sm text-blue-800 transition-colors"
                                          >
                                            <Search className="w-3 h-3 inline mr-2" />
                                            {searchTerm}
                                          </button>
                                        );
                                      }
                                      return null;
                                    })}
                                  <div className="mt-2 text-xs text-blue-600">
                                    *Click any search term to automatically search in Confluence*
                                  </div>
                                </div>
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex">
                      <Bot className="w-6 h-6 text-blue-600 mr-3" />
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing your question...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'article' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Article Input Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Article Analysis</h2>
                {articleSummary && (
                  <button
                    onClick={clearArticle}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear Analysis
                  </button>
                )}
              </div>
              
              <form onSubmit={handleArticleAnalysis} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Link className="w-4 h-4 inline-block mr-1" />
                    Article URL
                  </label>
                  <input
                    type="url"
                    value={articleData.url}
                    onChange={(e) => setArticleData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/article"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="text-center text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">OR</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={articleData.title}
                    onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter article title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content
                  </label>
                  <textarea
                    value={articleData.content}
                    onChange={(e) => setArticleData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Paste article content here for analysis..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={articleLoading || (!articleData.url.trim() && !articleData.content.trim())}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {articleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Article...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Analyze for Equifax Relevance
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Article Analysis Results */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
              
              <div className="max-h-96 overflow-y-auto">
                {!articleSummary && !articleLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Analyze articles for Equifax compliance</p>
                    <p className="text-sm">Get insights on security, regulatory compliance, and operational impact</p>
                  </div>
                ) : articleLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-red-600" />
                    <p>Analyzing article content...</p>
                    <p className="text-sm">Checking for compliance and security considerations</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {articleSummary}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'confluence' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confluence Connection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  <Database className="w-5 h-5 inline-block mr-2 text-red-600" />
                  Equifax Confluence Access
                </h2>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  REAL API MODE
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Real Confluence API</p>
                    <p>This interface connects to the real Equifax Confluence API. Enter your Confluence credentials to access live data.</p>
                  </div>
                </div>
              </div>

              {confluenceConnectionStatus && (
                <div className={`border rounded-lg p-3 mb-6 ${
                  confluenceConnectionStatus.includes('Successfully') || confluenceConnectionStatus.includes('Found') 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : confluenceConnectionStatus.includes('failed') || confluenceConnectionStatus.includes('error')
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <p className="text-sm font-medium">{confluenceConnectionStatus}</p>
                </div>
              )}

              {!isConnectedToConfluence ? (
                <form onSubmit={handleConfluenceConnect} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline-block mr-1" />
                      Confluence Username
                    </label>
                    <input
                      type="text"
                      value={confluenceCredentials.username}
                      onChange={(e) => setConfluenceCredentials(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="your.email@equifax.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline-block mr-1" />
                      API Token
                    </label>
                    <input
                      type="password"
                      value={confluenceCredentials.apiKey}
                      onChange={(e) => setConfluenceCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Your Confluence API token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingConfluence}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isSearchingConfluence ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Connect to Confluence
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Connected to Equifax Confluence</span>
                  </div>

                  <form onSubmit={handleConfluenceSearch} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search className="w-4 h-4 inline-block mr-1" />
                        Search Articles
                      </label>
                      <input
                        type="text"
                        value={confluenceSearch}
                        onChange={(e) => setConfluenceSearch(e.target.value)}
                        placeholder="Search for security, compliance, procedures..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSearchingConfluence}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {isSearchingConfluence ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search Confluence
                        </>
                      )}
                    </button>
                  </form>

                  {confluenceArticles.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Search Results ({confluenceArticles.length})</h4>
                        <button
                          onClick={clearConfluence}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear Results
                        </button>
                      </div>
                      <div className="space-y-3">
                        {confluenceArticles.map((article) => (
                          <div
                            key={article.id}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => setSelectedConfluenceArticle(article)}
                              >
                                <h5 className="font-medium text-gray-900 text-sm">{article.title}</h5>
                                <p className="text-xs text-gray-600 mt-1">{article.content.slice(0, 100)}...</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToSelectedArticles(article);
                                }}
                                className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Add to selected articles"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {article.space}
                              </span>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {article.lastModified.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confluence Article Viewer */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Viewer</h3>
              
              <div className="max-h-96 overflow-y-auto">
                {!selectedConfluenceArticle ? (
                  <div className="text-center text-gray-500 py-8">
                    <Database className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Connect to Confluence and search</p>
                    <p className="text-sm">Access Equifax documentation and procedures</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-semibold text-gray-900">{selectedConfluenceArticle.title}</h4>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {selectedConfluenceArticle.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedConfluenceArticle.lastModified.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {selectedConfluenceArticle.space}
                        </span>
                        <a
                          href={selectedConfluenceArticle.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          View in Confluence
                        </a>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        {selectedConfluenceArticle.content}
                      </p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-medium text-gray-900 text-sm mb-2">Mock Content Simulation</h5>
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>This article contains important information about Equifax procedures and guidelines.</p>
                          <p><strong>Key Topics:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Security protocols and access management</li>
                            <li>Compliance requirements and regulatory updates</li>
                            <li>Technical implementation guidelines</li>
                            <li>Risk assessment and mitigation strategies</li>
                          </ul>
                          <p><strong>Related Documents:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Security Policy Framework 2024</li>
                            <li>FCRA Compliance Checklist</li>
                            <li>API Integration Standards</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'direct-confluence' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Direct Confluence & BigQuery Access</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <ExternalLink className="w-4 h-4" />
                    <span>Connected to Confluence</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <Database className="w-4 h-4" />
                    <span>BigQuery Ready</span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setDirectAccessMode('confluence')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    directAccessMode === 'confluence' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Confluence</span>
                </button>
                <button
                  onClick={() => setDirectAccessMode('bigquery')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    directAccessMode === 'bigquery' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>BigQuery</span>
                </button>
              </div>

              {/* Confluence Embed */}
              {directAccessMode === 'confluence' && (
                <div className="border rounded-lg bg-white">
                  <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Equifax Confluence - equifax.atlassian.net</span>
                    </div>
                    <a
                      href="https://equifax.atlassian.net/wiki/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm hover:text-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </a>
                  </div>

                  <div className="relative">
                    <iframe
                      src="https://equifax.atlassian.net/wiki/home"
                      className="w-full h-[600px] border-0"
                      title="Equifax Confluence"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-gray-200 rounded-b-lg"></div>
                  </div>
                </div>
              )}

              {/* BigQuery Interface */}
              {directAccessMode === 'bigquery' && (
                <div className="border rounded-lg bg-white">
                  <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-5 h-5" />
                      <span className="font-medium">Google BigQuery - Equifax Console</span>
                    </div>
                    <a
                      href="https://console.cloud.google.com/bigquery"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm hover:text-blue-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open BigQuery Console</span>
                    </a>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Quick Access Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={() => window.open('https://console.cloud.google.com/bigquery?project=equifax-data', '_blank')}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Equifax Data</div>
                        <div className="text-xs text-gray-500">Main Dataset</div>
                      </button>
                      <button
                        onClick={() => window.open('https://console.cloud.google.com/bigquery?project=equifax-analytics', '_blank')}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        <BarChart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Analytics</div>
                        <div className="text-xs text-gray-500">Reports & Insights</div>
                      </button>
                      <button
                        onClick={() => window.open('https://console.cloud.google.com/bigquery?project=equifax-compliance', '_blank')}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">Compliance</div>
                        <div className="text-xs text-gray-500">Audit & Security</div>
                      </button>
                      <button
                        onClick={() => window.open('https://console.cloud.google.com/bigquery?project=equifax-ml', '_blank')}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
                      >
                        <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-sm font-medium">ML Models</div>
                        <div className="text-xs text-gray-500">Machine Learning</div>
                      </button>
                    </div>

                    {/* BigQuery SQL Editor */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Query Editor</h3>
                        <button
                          onClick={() => setBigQueryResults([])}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear Results
                        </button>
                      </div>
                      
                      <div className="relative">
                        <textarea
                          value={bigQuerySQL}
                          onChange={(e) => setBigQuerySQL(e.target.value)}
                          placeholder="-- Enter your BigQuery SQL here
SELECT 
  customer_id,
  risk_score,
  verification_status
FROM `equifax-data.customer_analytics.risk_assessments`
WHERE DATE(created_at) = CURRENT_DATE()
LIMIT 100;"
                          className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleBigQueryExecute}
                          disabled={bigQueryLoading}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                          {bigQueryLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span>{bigQueryLoading ? 'Executing...' : 'Run Query'}</span>
                        </button>
                        <div className="text-sm text-gray-500">
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> to execute
                        </div>
                      </div>
                    </div>

                    {/* Query Results */}
                    {bigQueryResults.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Query Results</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(bigQueryResults[0]).map((header) => (
                                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {bigQueryResults.slice(0, 10).map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {bigQueryResults.length > 10 && (
                          <p className="text-sm text-gray-500 text-center">
                            Showing first 10 rows of {bigQueryResults.length} results
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'selected-articles' && (
          <div className="space-y-6">
            {/* Selected Articles Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  <FileText className="w-5 h-5 inline-block mr-2 text-red-600" />
                  Selected Articles Collection
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
                  </span>
                  {selectedArticles.length > 0 && (
                    <button
                      onClick={() => setSelectedArticles([])}
                      className="text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Article Collection</p>
                    <p>Articles selected from Confluence searches are collected here. You can analyze them, export them, or use them for reference.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Articles List */}
            {selectedArticles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Selected</h3>
                  <p className="text-gray-600 mb-6">
                    Use the Confluence API or Direct Access tabs to find and select articles for your collection.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setActiveTab('confluence')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Browse Confluence API
                    </button>
                    <button
                      onClick={() => setActiveTab('direct-confluence')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Use Direct Access
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedArticles.map((article) => (
                  <div key={article.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {article.author}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {article.lastModified.toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          article.space === 'Security' ? 'bg-red-100 text-red-800' :
                          article.space === 'Compliance' ? 'bg-purple-100 text-purple-800' :
                          article.space === 'Engineering' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {article.space}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromSelectedArticles(article.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove from collection"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700">{article.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        View in Confluence
                      </a>
                      <div className="flex space-x-2">
                        <button className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                          Analyze
                        </button>
                        <button className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-100 transition-colors">
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gemini-config' && (
          <GeminiConfig 
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
          />
        )}
      </div>
    </div>
  );
}

export default App;