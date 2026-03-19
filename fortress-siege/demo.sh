#!/bin/bash

# Script de démonstration automatique
# Lance le serveur et ouvre plusieurs onglets pour simuler le multijoueur

echo "🎮 Fortress Siege - Mode Démo"
echo "=============================="
echo ""

# Vérifier que le serveur n'est pas déjà lancé
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Le serveur tourne déjà sur le port 3000"
    echo "Arrêter ? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo "✅ Serveur arrêté"
    else
        echo "❌ Démo annulée"
        exit 1
    fi
fi

# Installer les dépendances si nécessaire
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installation des dépendances..."
    cd backend
    npm install
    cd ..
fi

# Démarrer le serveur en arrière-plan
echo "🚀 Démarrage du serveur..."
cd backend
npm start > /dev/null 2>&1 &
SERVER_PID=$!
cd ..

# Attendre que le serveur soit prêt
echo "⏳ Attente du serveur..."
sleep 3

# Vérifier que le serveur répond
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Le serveur n'a pas démarré correctement"
    kill $SERVER_PID
    exit 1
fi

echo "✅ Serveur démarré (PID: $SERVER_PID)"
echo ""

# Fonction pour ouvrir un navigateur selon l'OS
open_browser() {
    local url=$1
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$url" 2>/dev/null || x-www-browser "$url" 2>/dev/null || echo "Ouvre manuellement : $url"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open "$url"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start "$url"
    else
        echo "Ouvre manuellement : $url"
    fi
}

echo "🌐 Ouverture du navigateur..."
echo ""

# Ouvrir 3 onglets pour simuler 3 joueurs
echo "   Joueur 1 (Défenseur)..."
open_browser "http://localhost:3000"
sleep 2

echo "   Joueur 2 (Attaquant)..."
open_browser "http://localhost:3000"
sleep 2

echo "   Joueur 3 (Défenseur)..."
open_browser "http://localhost:3000"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Démo lancée avec succès !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Instructions :"
echo "   1. Dans chaque onglet, entre un pseudo différent"
echo "   2. Observe la synchronisation en temps réel"
echo "   3. Teste les actions des deux équipes"
echo ""
echo "🛑 Pour arrêter la démo :"
echo "   Appuie sur Ctrl+C dans ce terminal"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fonction de nettoyage à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt de la démo..."
    kill $SERVER_PID 2>/dev/null
    echo "✅ Serveur arrêté"
    echo "👋 À bientôt !"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Garder le script actif
echo "📊 Logs du serveur :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -f backend/npm-debug.log 2>/dev/null || wait $SERVER_PID
