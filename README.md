# Equifax Knowledge Base

A React-based AI-powered information system with Gemini API integration.

## 🏗️ File Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header component
│   └── GeminiConfig.tsx # Gemini API configuration component
├── types/              # TypeScript type definitions
│   └── index.ts        # All interfaces and types
├── utils/              # Utility functions
│   ├── gemini.ts       # Gemini API related functions
│   └── confluence.ts   # Confluence API related functions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🚀 Features

### Core Functionality
- **Knowledge Base**: AI-powered Q&A with Gemini API
- **Article Reader**: Analyze external articles and content
- **Confluence Integration**: Search and connect to Confluence
- **Direct Access**: Direct Confluence search without API
- **Selected Articles**: Collection of saved articles
- **Gemini Config**: API key management and testing

### Technical Features
- **TypeScript**: Full type safety
- **Modular Architecture**: Clean separation of concerns
- **Error Handling**: Comprehensive error management
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live search and response

## 🔧 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Gemini API**
   - Go to the "Gemini Config" tab
   - Enter your Gemini API key
   - Test the connection

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Component Structure

### `components/Header.tsx`
- Navigation tabs
- Brand logo and title
- Selected articles counter

### `components/GeminiConfig.tsx`
- API key input and validation
- Connection testing
- Status indicators

### `utils/gemini.ts`
- `simulateAIResponse()`: Main Gemini API integration
- `validateApiKey()`: API key format validation
- `extractSearchSuggestions()`: Parse AI responses
- `generateMockResponse()`: Fallback responses

### `utils/confluence.ts`
- `handleConfluenceConnect()`: Confluence authentication
- `handleConfluenceAPISearch()`: Search Confluence API
- `mockConfluenceSearch()`: Mock data for testing

### `types/index.ts`
- All TypeScript interfaces
- Type definitions for components
- Shared type exports

## 🎯 Key Improvements

### Code Organization
- **Separated concerns**: UI, logic, and types
- **Reusable components**: Modular component structure
- **Utility functions**: Clean API integration
- **Type safety**: Comprehensive TypeScript types

### Performance
- **Lazy loading**: Components load as needed
- **Error boundaries**: Graceful error handling
- **Optimized API calls**: Timeout and retry logic

### Maintainability
- **Clear file structure**: Easy to navigate
- **Documented code**: Comprehensive comments
- **Modular design**: Easy to extend and modify

## 🔑 API Configuration

### Gemini API
- Requires valid API key from Google Cloud Console
- Supports real-time AI responses
- Includes fallback mock responses
- Comprehensive error handling

### Confluence API (Optional)
- Basic authentication support
- Search functionality
- Mock data for testing

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure your Gemini API key
4. Start development: `npm run dev`
5. Open http://localhost:3000

## 📝 Development

### Adding New Features
1. Create new component in `components/`
2. Add types to `types/index.ts`
3. Create utilities in `utils/`
4. Update main App.tsx

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add comprehensive error handling
- Include proper documentation 