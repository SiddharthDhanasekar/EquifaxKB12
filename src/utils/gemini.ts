import { QuestionData } from '../types';

export const validateApiKey = (key: string) => {
  return key.startsWith('AIza') && key.length > 30;
};

export const simulateAIResponse = async (
  input: string, 
  category: string, 
  geminiApiKey: string
): Promise<{response: string, searchSuggestions: string[]}> => {
  try {
    console.log('Using API key:', geminiApiKey.substring(0, 10) + '...');
    
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
      
      const mockResponse = generateMockResponse(input, category);
      const searchSuggestions = generateSearchSuggestions(input, category);
      
      return {
        response: mockResponse,
        searchSuggestions
      };
    }
  } catch (error) {
    console.error('Outer error in simulateAIResponse:', error);
    const mockResponse = generateMockResponse(input, category);
    const searchSuggestions = generateSearchSuggestions(input, category);
    
    return {
      response: mockResponse,
      searchSuggestions
    };
  }
};

export const extractSearchSuggestions = (responseText: string, input: string, category: string): string[] => {
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
  
  return generateSearchSuggestions(input, category);
};

export const generateSearchSuggestions = (input: string, category: string): string[] => {
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
  
  const suggestions = [
    ...inputKeywords.slice(0, 2).map(keyword => `${keyword} procedures`),
    ...categoryTerms.slice(0, 3)
  ];

  return suggestions.slice(0, 5);
};

export const generateMockResponse = (input: string, category: string): string => {
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