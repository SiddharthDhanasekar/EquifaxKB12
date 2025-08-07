# 🚀 Equifax Knowledge Base - Quick Start Guide

## 📦 **One-Click Setup**

### **Step 1: Extract & Navigate**
```bash
# Extract the zip file
unzip equifax-knowledge-base.zip

# Navigate to the project
cd equifax-knowledge-base
```

### **Step 2: Install Dependencies**
```bash
# Install Node.js dependencies
npm install
```

### **Step 3: Start the Application**
```bash
# Start the development server
npm run dev
```

### **Step 4: Open in Browser**
- Open your browser
- Go to: `http://localhost:3000` (or the port shown in terminal)
- The app is ready to use! 🎉

---

## 🔧 **System Requirements**

### **Required Software:**
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### **How to Install Node.js:**
1. Go to: https://nodejs.org/
2. Download the "LTS" version
3. Run the installer
4. Restart your terminal/command prompt

### **Verify Installation:**
```bash
node --version
npm --version
```

---

## 🎯 **Features Available**

### **Core Functionality:**
- ✅ **Knowledge Base**: AI-powered Q&A with Gemini API
- ✅ **Article Reader**: Analyze external articles
- ✅ **Confluence Integration**: Search Equifax documentation
- ✅ **Direct Access**: Direct Confluence and BigQuery access
- ✅ **Selected Articles**: Collection of saved articles
- ✅ **Gemini Config**: API key management

### **Pre-Configured:**
- ✅ Gemini API key already set
- ✅ All dependencies included
- ✅ Ready-to-run configuration

---

## 🛠️ **Troubleshooting**

### **If you get "command not found":**
```bash
# Make sure you're in the right directory
pwd
ls -la

# Should show package.json file
```

### **If npm install fails:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### **If port 3000 is in use:**
- The app will automatically use the next available port
- Check the terminal output for the correct URL

### **If you see "vite: command not found":**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📁 **Project Structure**
```
equifax-knowledge-base/
├── src/
│   ├── components/     # UI components
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── App.tsx        # Main application
├── package.json       # Dependencies
├── README.md          # Full documentation
└── QUICK_START.md     # This file
```

---

## 🎉 **You're Ready!**

The Equifax Knowledge Base is now running and ready to use. All features are pre-configured and working out of the box.

**Happy coding! 🚀** 