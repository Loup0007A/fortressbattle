#!/bin/bash

echo "🏰 Fortress Siege - Démarrage Rapide"
echo "===================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé !"
    echo "Télécharge-le sur https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Installer les dépendances backend
echo "📦 Installation des dépendances backend..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dépendances installées"
else
    echo "❌ Erreur lors de l'installation"
    exit 1
fi

echo ""
echo "🚀 Démarrage du serveur..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎮 Le jeu sera accessible sur :"
echo "   http://localhost:3000"
echo ""
echo "📱 Partage ce lien pour jouer avec d'autres !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Démarrer le serveur
npm start
