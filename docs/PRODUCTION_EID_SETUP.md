# Configuration eID pour Environnement de Production

## 1. 🏥 Déploiement sur Poste Médical

### Prérequis
- Windows 10/11 Pro ou Enterprise
- Lecteur de cartes eID certifié (ex: ACR38U, Omnikey)
- Middleware eID belge officiel installé

### Installation Complète
```bash
# 1. Télécharger et installer le middleware eID
# Depuis: https://eid.belgium.be/fr/middleware-eid
# Version recommandée: 5.1.x ou plus récente

# 2. Vérifier l'installation
# Ouvrir "services.msc" et vérifier que "Belgium eID Middleware" est démarré

# 3. Tester avec eID Viewer
# Lancer l'eID Viewer officiel et tester la lecture d'une carte
```

### Configuration du Service
```xml
<!-- Configuration Windows Service -->
<service>
  <name>Belgium eID Middleware</name>
  <port>53001</port>
  <autostart>true</autostart>
  <security>localhost-only</security>
</service>
```

## 2. 🌐 Déploiement Web Sécurisé

### Option A: Application Desktop (Recommandée)
```bash
# Utiliser Electron ou Tauri pour créer une app desktop
npm install electron --save-dev

# Avantages:
# - Accès direct au middleware localhost
# - Pas de restrictions CORS
# - Sécurité maximale
```

### Option B: Serveur Local avec Proxy
```javascript
// server.js - Serveur Node.js local
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy vers le middleware eID
app.use('/eid-api', createProxyMiddleware({
  target: 'http://localhost:53001',
  changeOrigin: true,
  pathRewrite: {
    '^/eid-api': ''
  }
}));

app.listen(3001, 'localhost');
```

## 3. 🔒 Configuration Sécurisée

### Certificats SSL pour Localhost
```bash
# Générer certificat auto-signé pour HTTPS local
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Configuration Vite pour HTTPS
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    host: 'localhost',
    port: 5173
  }
});
```

## 4. 🏗️ Architecture de Production

### Schéma Recommandé
```
[Cabinet Médical]
├── Poste Médical Windows
│   ├── Middleware eID (port 53001)
│   ├── Lecteur de cartes
│   └── Application OphtalmoPro (Electron)
├── Serveur Local/Cloud
│   ├── Base de données patients
│   ├── API REST sécurisée
│   └── Sauvegarde automatique
└── Réseau Sécurisé
    ├── VPN médical
    ├── Chiffrement TLS 1.3
    └── Conformité RGPD
```

## 5. 📋 Checklist de Déploiement

### Avant Déploiement
- [ ] Middleware eID installé et testé
- [ ] Lecteur de cartes fonctionnel
- [ ] Certificats SSL configurés
- [ ] Base de données sécurisée
- [ ] Sauvegarde automatique
- [ ] Tests avec vraies cartes eID

### Tests de Production
- [ ] Lecture de cartes eID variées
- [ ] Performance sous charge
- [ ] Gestion des erreurs
- [ ] Sécurité des données
- [ ] Conformité réglementaire

## 6. 🚀 Scripts de Déploiement

### Build de Production
```bash
# Build optimisé
npm run build

# Test de production local
npm run preview

# Déploiement Electron
npm run electron:build
```

### Monitoring
```javascript
// Surveillance du middleware
setInterval(async () => {
  try {
    const status = await eidService.testConnection();
    console.log('Middleware status:', status);
  } catch (error) {
    console.error('Middleware down:', error);
    // Alerter l'administrateur
  }
}, 60000); // Vérification chaque minute
```

## 7. 🔧 Dépannage Production

### Problèmes Courants
1. **Port 53001 bloqué**: Vérifier pare-feu Windows
2. **Service arrêté**: Redémarrer "Belgium eID Middleware"
3. **Lecteur non reconnu**: Réinstaller pilotes
4. **Carte non lue**: Nettoyer la carte et le lecteur

### Logs de Diagnostic
```javascript
// Activer les logs détaillés
localStorage.setItem('eid-debug', 'true');

// Exporter les logs pour support
const exportLogs = () => {
  const logs = localStorage.getItem('eid-logs');
  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eid-logs-${new Date().toISOString()}.txt`;
  a.click();
};
```

## 8. 📞 Support et Maintenance

### Contacts Utiles
- **Support eID Belgique**: https://eid.belgium.be/fr/support
- **Documentation technique**: https://github.com/Fedict/eid-mw
- **Forum développeurs**: https://github.com/Fedict/eid-mw/discussions

### Maintenance Préventive
- Mise à jour mensuelle du middleware
- Nettoyage des lecteurs de cartes
- Vérification des certificats SSL
- Sauvegarde des configurations