# 📦 Installation Guide - Equifax Knowledge Base

## 🖥️ **Choose Your Operating System**

### **Windows Users:**
1. **Install Node.js:**
   - Go to https://nodejs.org/
   - Download the "LTS" version
   - Run the installer (accept all defaults)
   - Restart your computer

2. **Run the Application:**
   - Double-click `start.bat`
   - Or open Command Prompt and run:
   ```cmd
   npm install
   npm run dev
   ```

### **macOS Users:**
1. **Install Node.js:**
   - Go to https://nodejs.org/
   - Download the "LTS" version
   - Run the installer
   - Or use Homebrew: `brew install node`

2. **Run the Application:**
   - Double-click `start.sh`
   - Or open Terminal and run:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

### **Linux Users:**
1. **Install Node.js:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm

   # CentOS/RHEL
   sudo yum install nodejs npm

   # Or download from https://nodejs.org/
   ```

2. **Run the Application:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

---

## 🔧 **Manual Installation (Alternative)**

### **Step 1: Install Node.js**
- Download from: https://nodejs.org/
- Choose the "LTS" version
- Follow the installer instructions

### **Step 2: Verify Installation**
```bash
node --version
npm --version
```

### **Step 3: Run the Application**
```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

### **Step 4: Open in Browser**
- Go to: `http://localhost:3000`
- The app is ready! 🎉

---

## 🚨 **Troubleshooting**

### **"node: command not found"**
- Node.js is not installed
- Download from https://nodejs.org/
- Restart your terminal after installation

### **"npm: command not found"**
- npm comes with Node.js
- Reinstall Node.js from https://nodejs.org/

### **"Permission denied" (Linux/macOS)**
```bash
chmod +x start.sh
```

### **"Port 3000 is in use"**
- The app will automatically use the next available port
- Check the terminal output for the correct URL

### **"Failed to install dependencies"**
```bash
npm cache clean --force
npm install
```

---

## ✅ **Verification**

After installation, you should see:
- ✅ Node.js installed
- ✅ npm installed
- ✅ Dependencies installed
- ✅ Server running on http://localhost:3000
- ✅ All features working

---

## 🎯 **Quick Commands**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📞 **Need Help?**

1. Check the `QUICK_START.md` file
2. Read the `README.md` for detailed documentation
3. Make sure Node.js is installed correctly
4. Try the troubleshooting steps above

**Happy coding! 🚀** 