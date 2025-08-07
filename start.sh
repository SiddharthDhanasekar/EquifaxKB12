#!/bin/bash

# 🚀 Equifax Knowledge Base - One-Click Startup Script
echo "🚀 Starting Equifax Knowledge Base..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "Please install npm (comes with Node.js)"
    echo "Then run this script again."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    echo "Please make sure you're in the correct directory."
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✅ Node.js and npm found"
echo "📦 Installing dependencies..."

# Install dependencies
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    echo "Try running: npm cache clean --force && npm install"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo "🌐 Starting development server..."

# Start the development server
npm run dev

echo "🎉 Application started!"
echo "📱 Open your browser and go to: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server" 