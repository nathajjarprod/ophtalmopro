# Guide de Test eID en Environnement de Production

## 🏥 Configuration Poste Médical pour Tests

### 1. Prérequis Matériels
- **Ordinateur Windows 10/11 Pro** (recommandé pour stabilité)
- **Lecteur de cartes eID certifié** :
  - ACR38U-I1 (recommandé)
  - Omnikey CardMan 3121
  - Gemalto IDBridge CT30
  - Tous lecteurs compatibles PC/SC

### 2. Installation du Middleware eID Officiel

#### Téléchargement
```bash
# URL officielle du middleware
https://eid.belgium.be/fr/middleware-eid

# Version recommandée : 5.1.x ou plus récente
# Choisir la version appropriée :
# - Windows 64-bit (la plus courante)
# - Windows 32-bit (systèmes anciens)
```

#### Installation
1. **Exécuter l'installateur** en tant qu'administrateur
2. **Accepter** tous les composants par défaut
3. **Redémarrer** l'ordinateur après installation
4. **Vérifier** que le service est démarré

#### Vérification du Service
```cmd
# Ouvrir "services.msc"
# Chercher : "Belgium eID Middleware" ou "eID Middleware"
# Statut doit être : "Démarré"
# Type de démarrage : "Automatique"

# Alternative en ligne de commande :
sc query "Belgium eID Middleware"
```

### 3. Test avec eID Viewer Officiel

#### Installation eID Viewer
- Inclus avec le middleware ou téléchargeable séparément
- Localisation typique : `C:\Program Files\Belgium Identity Card\`

#### Test de Base
1. **Lancer eID Viewer**
2. **Insérer une carte eID** dans le lecteur
3. **Vérifier** que toutes les données s'affichent :
   - Identité
   - Adresse
   - Photo
   - Certificats

### 4. Configuration de l'Application OphtalmoPro

#### Mode Production
```javascript
// Créer un fichier .env.production
NODE_ENV=production
VITE_EID_PRODUCTION_MODE=true
VITE_EID_SIMULATION_DISABLED=true
```

#### Build de Production
```bash
# Build optimisé pour production
npm run build:prod

# Servir en mode production local
npm run preview:prod
```

#### Configuration HTTPS (Recommandé)
```bash
# Générer certificat auto-signé pour tests locaux
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Configurer Vite pour HTTPS
# Voir vite.config.ts pour configuration SSL
```

### 5. Tests de Validation

#### Test 1 : Connectivité Middleware
```javascript
// Dans la console du navigateur
fetch('http://localhost:53001/service/info')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

#### Test 2 : Détection Lecteurs
```javascript
// Test des lecteurs disponibles
fetch('http://localhost:53001/readers')
  .then(r => r.json())
  .then(console.log);
```

#### Test 3 : Lecture Carte Complète
1. **Ouvrir OphtalmoPro** en mode production
2. **Aller dans "Nouveau patient"**
3. **Cliquer sur "Lire carte eID"**
4. **Vérifier** que toutes les données sont lues correctement

### 6. Résolution des Problèmes Courants

#### Problème : Port 53001 bloqué
```cmd
# Vérifier si le port est utilisé
netstat -an | findstr :53001

# Vérifier le pare-feu Windows
# Panneau de configuration > Système et sécurité > Pare-feu Windows Defender
# Autoriser une application > Ajouter "Belgium eID Middleware"
```

#### Problème : Service non démarré
```cmd
# Redémarrer le service
net stop "Belgium eID Middleware"
net start "Belgium eID Middleware"

# Ou via services.msc
```

#### Problème : Lecteur non reconnu
1. **Gestionnaire de périphériques** → Vérifier lecteur
2. **Réinstaller pilotes** du lecteur
3. **Tester avec autre port USB**
4. **Vérifier compatibilité** PC/SC

#### Problème : Carte non lue
1. **Nettoyer la carte** avec un chiffon doux
2. **Nettoyer le lecteur** (contacts)
3. **Vérifier expiration** de la carte
4. **Tester avec autre carte** eID

### 7. Monitoring en Production

#### Surveillance Automatique
```javascript
// Ajouter dans l'application
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:53001/service/info');
    if (!response.ok) {
      console.error('Middleware eID indisponible');
      // Alerter l'utilisateur
    }
  } catch (error) {
    console.error('Erreur middleware:', error);
  }
}, 60000); // Vérification chaque minute
```

#### Logs de Diagnostic
```javascript
// Activer les logs détaillés
localStorage.setItem('eid-debug', 'true');

// Exporter les logs
const exportLogs = () => {
  const logs = localStorage.getItem('eid-logs') || 'Aucun log';
  const blob = new Blob([logs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eid-logs-${new Date().toISOString()}.txt`;
  a.click();
};
```

### 8. Checklist de Validation Production

#### Avant Déploiement
- [ ] Middleware eID installé et fonctionnel
- [ ] Service Windows démarré automatiquement
- [ ] Lecteur de cartes reconnu
- [ ] Test avec eID Viewer réussi
- [ ] Application en mode production
- [ ] HTTPS configuré (recommandé)
- [ ] Pare-feu configuré
- [ ] Tests avec plusieurs cartes eID

#### Tests de Validation
- [ ] Lecture identité complète
- [ ] Lecture adresse
- [ ] Gestion des erreurs
- [ ] Performance acceptable (< 10 secondes)
- [ ] Pas de simulation activée
- [ ] Logs de production configurés

### 9. Support et Maintenance

#### Contacts Utiles
- **Support eID Belgique** : https://eid.belgium.be/fr/support
- **Documentation technique** : https://github.com/Fedict/eid-mw
- **Forum développeurs** : https://github.com/Fedict/eid-mw/discussions

#### Maintenance Préventive
- **Mise à jour mensuelle** du middleware
- **Nettoyage régulier** des lecteurs
- **Vérification des certificats**
- **Sauvegarde des configurations**
- **Test périodique** avec différentes cartes

### 10. Déploiement Electron (Recommandé)

Pour un environnement de production optimal, utilisez la version Electron :

```bash
# Build Electron pour production
npm run electron:build

# L'application desktop évite les restrictions CORS
# et offre une meilleure intégration système
```

## 🚀 Commandes Rapides

```bash
# Vérification rapide du middleware
curl http://localhost:53001/service/info

# Test des lecteurs
curl http://localhost:53001/readers

# Build production
npm run build:prod && npm run preview:prod

# Logs en temps réel (Windows)
Get-EventLog -LogName Application -Source "Belgium eID Middleware" -Newest 10
```