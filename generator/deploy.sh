#!/bin/bash
# TESTIMOTION Generator - Deployment Script

echo "======================================"
echo "TESTIMOTION Generator Deployment"
echo "======================================"
echo ""

# Check if Vercel or Firebase is requested
if [ "$1" == "vercel" ]; then
    echo "Deploying to Vercel..."
    echo ""

    # Check if vercel is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi

    echo "Starting deployment..."
    vercel --prod

elif [ "$1" == "firebase" ]; then
    echo "Deploying to Firebase..."
    echo ""

    # Check if firebase is installed
    if ! command -v firebase &> /dev/null; then
        echo "Installing Firebase CLI..."
        npm install -g firebase-tools
    fi

    # Install function dependencies
    echo "Installing dependencies..."
    cd functions && npm install && cd ..

    echo "Starting deployment..."
    firebase deploy

else
    echo "Usage: ./deploy.sh [vercel|firebase]"
    echo ""
    echo "Options:"
    echo "  vercel   - Deploy to Vercel (recommended)"
    echo "  firebase - Deploy to Firebase Hosting + Functions"
    echo ""
    echo "Prerequisites:"
    echo "  1. Create accounts at vercel.com or firebase.google.com"
    echo "  2. Get a GEMINI_API_KEY from makersuite.google.com"
    echo "  3. Run: ./deploy.sh vercel  OR  ./deploy.sh firebase"
fi
