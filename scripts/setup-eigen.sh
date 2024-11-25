#!/bin/bash

# Check if we're in the project root (looking for package.json as indicator)
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root (where package.json is located)"
    exit 1
fi

# Check if eigen directory already exists
if [ -d "eigen" ]; then
    echo "⚠️  eigen directory already exists! Exiting to prevent overwriting..."
    exit 1
fi

echo "🚀 Starting Eigen setup..."

# Create eigen directory
echo "📁 Creating eigen directory..."
mkdir eigen

# Clone Eigen into a temporary location
echo "📥 Cloning Eigen repository..."
if git clone https://gitlab.com/libeigen/eigen.git temp-eigen; then
    echo "✅ Eigen clone successful!"
else
    echo "❌ Failed to clone Eigen repository"
    rm -rf eigen  # Clean up the created directory
    exit 1
fi

# Copy the Eigen headers to project's eigen directory
echo "📋 Copying Eigen headers to project..."
if cp -r temp-eigen/Eigen ./eigen/; then
    echo "✅ Headers copied successfully!"
else
    echo "❌ Failed to copy Eigen headers"
    rm -rf eigen temp-eigen
    exit 1
fi

# Clean up
echo "🧹 Cleaning up temporary files..."
rm -rf temp-eigen

echo "🎉 Setup complete! Eigen headers are now available in ./eigen/"
echo "🔨 You can now build your project using:"
echo "npm run build"
