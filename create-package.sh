#!/bin/bash

# 📦 Create Distribution Package for Equifax Knowledge Base

echo "📦 Creating distribution package..."

# Create the package directory
PACKAGE_NAME="equifax-knowledge-base"
PACKAGE_DIR="../$PACKAGE_NAME"

# Remove existing package if it exists
if [ -d "$PACKAGE_DIR" ]; then
    echo "🗑️  Removing existing package..."
    rm -rf "$PACKAGE_DIR"
fi

# Create package directory
mkdir -p "$PACKAGE_DIR"

echo "📁 Copying project files..."

# Copy all necessary files
cp -r src/ "$PACKAGE_DIR/"
cp -r public/ "$PACKAGE_DIR/" 2>/dev/null || mkdir -p "$PACKAGE_DIR/public"
cp package.json "$PACKAGE_DIR/"
cp package-lock.json "$PACKAGE_DIR/" 2>/dev/null || echo "No package-lock.json found"
cp vite.config.ts "$PACKAGE_DIR/"
cp tsconfig.json "$PACKAGE_DIR/"
cp tailwind.config.js "$PACKAGE_DIR/"
cp postcss.config.js "$PACKAGE_DIR/"
cp index.html "$PACKAGE_DIR/"
cp README.md "$PACKAGE_DIR/"
cp QUICK_START.md "$PACKAGE_DIR/"
cp INSTALL.md "$PACKAGE_DIR/"
cp start.sh "$PACKAGE_DIR/"
cp start.bat "$PACKAGE_DIR/"

# Make scripts executable
chmod +x "$PACKAGE_DIR/start.sh"

echo "📋 Creating package info..."

# Create a simple info file
cat > "$PACKAGE_DIR/PACKAGE_INFO.txt" << EOF
🚀 Equifax Knowledge Base - Distribution Package

📦 Package Contents:
- Complete React/Vite application
- All dependencies listed in package.json
- Pre-configured Gemini API key
- One-click startup scripts for all platforms
- Comprehensive documentation

🖥️ Supported Platforms:
- Windows (start.bat)
- macOS (start.sh)
- Linux (start.sh)

📖 Quick Start:
1. Install Node.js from https://nodejs.org/
2. Extract this package
3. Run start.bat (Windows) or ./start.sh (macOS/Linux)
4. Open http://localhost:3000 in your browser

📚 Documentation:
- README.md - Full documentation
- QUICK_START.md - Quick setup guide
- INSTALL.md - Installation instructions

🎯 Features:
- AI-powered Knowledge Base with Gemini API
- Article Reader and Analysis
- Confluence Integration
- Direct Access to Confluence and BigQuery
- Selected Articles Collection
- API Key Management

📞 Need Help?
Check the documentation files or visit the project repository.

Created: $(date)
Version: 1.0.0
EOF

echo "🗜️  Creating zip archive..."

# Create zip archive
cd ..
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME" -x "*.DS_Store" "*/node_modules/*" "*/dist/*" "*.log"

echo "✅ Package created successfully!"
echo "📦 Archive: ${PACKAGE_NAME}.zip"
echo "📁 Size: $(du -sh "${PACKAGE_NAME}.zip" | cut -f1)"
echo ""
echo "🚀 Ready to distribute!"
echo "📤 Send the ${PACKAGE_NAME}.zip file to any computer"
echo "📖 Include the QUICK_START.md instructions"
echo ""
echo "🎯 Recipient instructions:"
echo "1. Install Node.js from https://nodejs.org/"
echo "2. Extract the zip file"
echo "3. Run start.bat (Windows) or ./start.sh (macOS/Linux)"
echo "4. Open http://localhost:3000 in browser" 