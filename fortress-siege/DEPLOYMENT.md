# 🚀 Guide de Déploiement - Fortress Siege

## Déploiement Local (Test)

### Option 1 : Script automatique
```bash
cd fortress-siege
./start.sh
```

### Option 2 : Manuel
```bash
cd backend
npm install
npm start
```

Accéder à : `http://localhost:3000`

---

## Déploiement Production

### 🌐 Railway (Recommandé - Gratuit)

**Avantages** : Gratuit, simple, auto-scaling

1. **Créer un compte** sur [railway.app](https://railway.app)

2. **Push sur GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [votre-repo-github]
git push -u origin main
```

3. **Déployer sur Railway**
   - Connecter Railway à GitHub
   - Sélectionner le repo `fortress-siege`
   - Railway détecte automatiquement Node.js
   - Définir le Start Command : `cd backend && npm start`
   - Définir Root Directory : `/`
   
4. **Variables d'environnement** (optionnel)
   - `PORT` : Railway le définit automatiquement
   - `NODE_ENV` : `production`

5. **Accéder au jeu**
   - Railway génère une URL : `https://fortress-siege-xxx.railway.app`

---

### 🟣 Heroku (Payant mais fiable)

1. **Installer Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Créer l'app**
```bash
heroku create fortress-siege-game
```

3. **Créer un Procfile** (à la racine)
```
web: cd backend && npm start
```

4. **Déployer**
```bash
git push heroku main
heroku open
```

5. **Logs en temps réel**
```bash
heroku logs --tail
```

---

### 🐳 Docker (Pour VPS)

1. **Créer un Dockerfile** (à la racine)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copier le code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "server.js"]
```

2. **Build l'image**
```bash
docker build -t fortress-siege .
```

3. **Run le container**
```bash
docker run -d -p 3000:3000 --name fortress-game fortress-siege
```

4. **Docker Compose** (optionnel)
```yaml
version: '3.8'
services:
  game:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

```bash
docker-compose up -d
```

---

### 💧 DigitalOcean (VPS manuel)

**Prix** : ~5$/mois pour un Droplet basic

1. **Créer un Droplet Ubuntu 22.04**

2. **Se connecter en SSH**
```bash
ssh root@your-ip
```

3. **Installer Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Installer Git**
```bash
sudo apt-get install git
```

5. **Cloner le projet**
```bash
git clone https://github.com/your-username/fortress-siege.git
cd fortress-siege/backend
npm install --production
```

6. **Installer PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start server.js --name fortress-siege
pm2 startup
pm2 save
```

7. **Nginx (Reverse Proxy)**
```bash
sudo apt-get install nginx

# Créer la config
sudo nano /etc/nginx/sites-available/fortress-siege
```

Contenu :
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fortress-siege /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **SSL avec Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

9. **Vérifier**
   - Accéder à `https://your-domain.com`

---

### 🔥 Vercel (Frontend uniquement)

Si vous séparez backend/frontend :

1. **Backend** : Railway/Heroku
2. **Frontend** : Vercel

**Déployer sur Vercel** :
```bash
cd frontend
vercel
```

Mettre à jour `BACKEND_URL` dans `game.js` avec l'URL Railway.

---

## Variables d'Environnement

### Backend (.env)
```bash
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.com
```

### Frontend (game.js)
```javascript
const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend.railway.app'
  : 'http://localhost:3000';
```

---

## Monitoring & Maintenance

### Logs
```bash
# Railway : Dashboard > Deployments > Logs
# Heroku : heroku logs --tail
# PM2 : pm2 logs fortress-siege
```

### Redémarrer
```bash
# Railway : Dashboard > Restart
# Heroku : heroku restart
# PM2 : pm2 restart fortress-siege
```

### Mise à jour
```bash
git pull origin main
# Railway : Auto-deploy
# Heroku : git push heroku main
# VPS : pm2 restart fortress-siege
```

---

## Scalabilité

### Redis (pour 1000+ joueurs simultanés)

1. **Installer Redis**
```bash
# Railway : Ajouter Redis service
# Heroku : heroku addons:create heroku-redis:hobby-dev
```

2. **Modifier gameManager.js**
```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Sauvegarder l'état
await client.set('gameState', JSON.stringify(this.state));

// Récupérer l'état
const state = JSON.parse(await client.get('gameState'));
```

### Load Balancing (pour 10k+ joueurs)

1. Utiliser Nginx comme load balancer
2. Lancer plusieurs instances du serveur
3. Utiliser Redis pour le state partagé
4. Socket.IO sticky sessions

---

## Backup & Sécurité

### Backup automatique
```bash
# Cron job pour backup journalier
0 2 * * * pg_dump fortress_db > backup-$(date +\%Y\%m\%d).sql
```

### Sécurité
- [ ] HTTPS obligatoire (Let's Encrypt)
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation (joi/express-validator)
- [ ] Helmet.js pour headers sécurisés
- [ ] CORS configuré strictement

---

## Coûts Estimés

| Service | Prix | Capacité |
|---------|------|----------|
| Railway (Free) | 0€ | 500h/mois, ~50 joueurs |
| Railway (Pro) | 5€/mois | Illimité, ~500 joueurs |
| Heroku Hobby | 7$/mois | ~100 joueurs |
| DigitalOcean | 5$/mois | ~200 joueurs |
| Redis Upstash | Gratuit | 10k commandes/jour |

---

## Checklist Pré-Production

- [ ] Tests de charge (k6.io)
- [ ] Monitoring configuré (Sentry)
- [ ] Backups automatiques
- [ ] Rate limiting activé
- [ ] Variables d'environnement sécurisées
- [ ] SSL/HTTPS actif
- [ ] Logs centralisés
- [ ] Plan de rollback

---

**Besoin d'aide ?** Ouvre une issue sur GitHub ! 🚀
