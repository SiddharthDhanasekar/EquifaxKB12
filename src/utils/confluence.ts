import { ConfluenceArticle, ConfluenceCredentials } from '../types';

export const handleConfluenceConnect = async (
  e: React.FormEvent,
  confluenceCredentials: ConfluenceCredentials,
  setIsSearchingConfluence: (loading: boolean) => void,
  setConfluenceConnectionStatus: (status: string) => void,
  setIsConnectedToConfluence: (connected: boolean) => void
) => {
  e.preventDefault();
  
  if (!confluenceCredentials.username.trim() || !confluenceCredentials.apiKey.trim()) {
    setConfluenceConnectionStatus('Please enter both username and API token');
    return;
  }

  setIsSearchingConfluence(true);
  setConfluenceConnectionStatus('Connecting to Equifax Confluence...');
  
  try {
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
      setConfluenceConnectionStatus(`✅ Connected as ${userData.displayName} (${userData.emailAddress})`);
      setIsConnectedToConfluence(true);
    } else {
      setConfluenceConnectionStatus('❌ Connection failed. Please check your credentials.');
      setIsConnectedToConfluence(false);
    }
  } catch (error) {
    console.error('Confluence connection error:', error);
    setConfluenceConnectionStatus('❌ Connection error. Please check your network and credentials.');
    setIsConnectedToConfluence(false);
  } finally {
    setIsSearchingConfluence(false);
  }
};

export const handleConfluenceAPISearch = async (
  e: React.FormEvent,
  confluenceSearch: string,
  confluenceCredentials: ConfluenceCredentials,
  setIsSearchingConfluence: (loading: boolean) => void,
  setConfluenceArticles: (articles: ConfluenceArticle[]) => void,
  setConfluenceConnectionStatus: (status: string) => void
) => {
  e.preventDefault();
  
  if (!confluenceSearch.trim()) return;

  setIsSearchingConfluence(true);
  setConfluenceConnectionStatus('Searching Confluence...');
  
  try {
    const auth = btoa(`${confluenceCredentials.username}:${confluenceCredentials.apiKey}`);
    const response = await fetch(`https://equifax.atlassian.net/wiki/rest/api/content/search?cql=text~"${encodeURIComponent(confluenceSearch)}"&limit=10`, {
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
      const articles: ConfluenceArticle[] = data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.excerpt || 'No content available',
        lastModified: new Date(item.lastModified),
        author: item.lastModifiedBy?.displayName || 'Unknown',
        space: item.space?.name || 'Unknown',
        url: `https://equifax.atlassian.net/wiki${item._links.webui}`
      }));
      
      setConfluenceArticles(articles);
      setConfluenceConnectionStatus(`Found ${articles.length} articles for "${confluenceSearch}"`);
    } else {
      setConfluenceConnectionStatus('❌ Search failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Confluence search error:', error);
    setConfluenceConnectionStatus('❌ Search error. Please try again.');
  } finally {
    setIsSearchingConfluence(false);
  }
};

export const mockConfluenceSearch = async (query: string): Promise<ConfluenceArticle[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const mockArticles: ConfluenceArticle[] = [
    {
      id: '1',
      title: 'Security Framework Implementation Guide',
      content: 'Comprehensive guide for implementing security frameworks across Equifax systems. Includes best practices for access control, encryption, and monitoring protocols.',
      lastModified: new Date('2024-01-15'),
      author: 'Security Team',
      space: 'Security',
      url: 'https://equifax.atlassian.net/wiki/spaces/SEC/pages/123456'
    },
    {
      id: '2',
      title: 'FCRA Compliance Procedures',
      content: 'Detailed procedures for maintaining FCRA compliance in credit reporting operations. Covers data accuracy, consumer rights, and dispute resolution processes.',
      lastModified: new Date('2024-01-10'),
      author: 'Compliance Team',
      space: 'Compliance',
      url: 'https://equifax.atlassian.net/wiki/spaces/COMP/pages/789012'
    },
    {
      id: '3',
      title: 'API Integration Standards',
      content: 'Technical standards and guidelines for API integration with Equifax systems. Includes authentication, error handling, and performance requirements.',
      lastModified: new Date('2024-01-08'),
      author: 'Engineering Team',
      space: 'Engineering',
      url: 'https://equifax.atlassian.net/wiki/spaces/ENG/pages/345678'
    },
    {
      id: '4',
      title: 'Identity Verification Workflow',
      content: 'Standard operating procedures for consumer identity verification processes. Includes document validation, fraud detection, and escalation procedures.',
      lastModified: new Date('2024-01-05'),
      author: 'Operations Team',
      space: 'Operations',
      url: 'https://equifax.atlassian.net/wiki/spaces/OPS/pages/901234'
    },
    {
      id: '5',
      title: 'Data Breach Response Protocol',
      content: 'Emergency procedures and escalation paths for security incidents. Includes notification requirements, containment procedures, and recovery steps.',
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