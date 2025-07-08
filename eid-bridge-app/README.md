# OphtalmoPro eID Bridge - Application Windows

## 🎯 Objectif

Cette application Windows se charge de :
1. **Lire les cartes eID** via le middleware belge officiel
2. **Transférer les données** de manière sécurisée vers l'application web
3. **Résoudre les problèmes** de VMware et de compatibilité

## 🏗️ Architecture

```
[Carte eID] → [Lecteur] → [App Windows Bridge] → [API Locale] → [App Web]
```

### Composants
- **Service Windows** : Lecture continue des cartes
- **API REST locale** : Communication avec l'app web
- **Interface utilisateur** : Configuration et monitoring
- **Chiffrement** : Sécurisation des données

## 🚀 Installation

### Prérequis
1. **Windows 10/11** (64-bit recommandé)
2. **.NET 6.0 Runtime** ou plus récent
3. **Middleware eID belge** installé
4. **Lecteur de cartes** compatible

### Installation Automatique
1. Télécharger `OphtalmoPro-eID-Bridge-Setup.exe`
2. Exécuter en tant qu'administrateur
3. Suivre l'assistant d'installation
4. Redémarrer si demandé

### Installation Manuelle
1. Extraire `OphtalmoPro-eID-Bridge.zip`
2. Copier dans `C:\Program Files\OphtalmoPro\eID-Bridge\`
3. Exécuter `install-service.bat` en tant qu'administrateur
4. Configurer via l'interface

## ⚙️ Configuration

### 1. Premier Démarrage
- L'application se lance automatiquement
- Configuration guidée au premier démarrage
- Test de connectivité avec le middleware eID

### 2. Paramètres Réseau
- **Port API** : 9597 (HTTPS) par défaut
- **Certificat SSL** : Auto-généré ou personnalisé
- **Accès** : Localhost uniquement (sécurité)

### 3. Sécurité
- **Chiffrement AES-256** des données
- **Tokens temporaires** (expiration 5 minutes)
- **Logs d'audit** complets
- **Accès restreint** aux applications autorisées

## 🔧 Utilisation

### Interface Principale
- **État du service** : Vert = Opérationnel
- **Lecteurs détectés** : Liste des lecteurs actifs
- **Dernière lecture** : Horodatage et statut
- **Logs en temps réel** : Activité détaillée

### API REST

#### Endpoints Disponibles

**GET /api/status**
```json
{
  "status": "ready",
  "middleware": "available",
  "readers": 2,
  "lastRead": "2024-01-22T10:30:00Z"
}
```

**POST /api/read-card**
```json
{
  "includePhoto": true,
  "includeAddress": true,
  "timeout": 30000
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "firstName": "Marie",
    "lastName": "Dubois",
    "dateOfBirth": "15/03/1979",
    "niss": "79.03.15-123.45",
    "address": {
      "street": "Rue de la Paix 123",
      "postalCode": "1000",
      "city": "Bruxelles"
    }
  },
  "timestamp": "2024-01-22T10:30:00Z"
}
```

### Intégration Web

```javascript
// Dans votre application web
const readEidCard = async () => {
  try {
    const response = await fetch('https://localhost:9597/api/read-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getBridgeToken()
      },
      body: JSON.stringify({
        includePhoto: true,
        includeAddress: true
      })
    });
    
    const result = await response.json();
    if (result.success) {
      // Utiliser result.data
      populatePatientForm(result.data);
    }
  } catch (error) {
    console.error('Erreur lecture eID:', error);
  }
};
```

## 🛡️ Sécurité

### Authentification
- **Tokens JWT** avec expiration courte
- **Clés rotatives** générées automatiquement
- **Whitelist d'applications** autorisées

### Chiffrement
- **TLS 1.3** pour les communications
- **AES-256** pour le stockage temporaire
- **Certificats auto-signés** ou CA personnalisée

### Audit
- **Logs détaillés** de toutes les opérations
- **Horodatage précis** des lectures
- **Traçabilité complète** des accès

## 🔍 Dépannage

### Problème de Port "Address already in use"

Si vous obtenez l'erreur "Failed to bind to address", suivez ces étapes :

1. **Nettoyage rapide** :
   ```cmd
   force-kill-ports.bat
   ```

2. **Diagnostic complet** :
   ```cmd
   diagnose-port-issue.bat
   ```

3. **Nettoyage nucléaire** (si le problème persiste) :
   ```cmd
   nuclear-cleanup.bat
   ```

4. **Démarrage sécurisé** :
   ```cmd
   safe-start.bat
   ```

### Problèmes Courants

#### "Service non démarré"
1. Ouvrir `services.msc`
2. Chercher "OphtalmoPro eID Bridge"
3. Clic droit → Démarrer
4. Configurer en "Automatique"

#### "Lecteur non détecté"
1. Vérifier connexion USB
2. Tester avec eID Viewer
3. Redémarrer le service
4. Réinstaller les pilotes

#### "Erreur de certificat"
1. Régénérer le certificat SSL
2. Ajouter exception dans le navigateur
3. Vérifier la configuration HTTPS

### Logs de Diagnostic

**Emplacement :** `C:\ProgramData\OphtalmoPro\eID-Bridge\Logs\`

**Niveaux :**
- `ERROR` : Erreurs critiques
- `WARN` : Avertissements
- `INFO` : Informations générales
- `DEBUG` : Détails techniques

### Commandes Utiles

```cmd
# Redémarrer le service
net stop "OphtalmoPro eID Bridge"
net start "OphtalmoPro eID Bridge"

# Vérifier le port
netstat -an | findstr :9597

# Test de connectivité
curl -k https://localhost:9597/api/status
```

## 📊 Monitoring

### Métriques Disponibles
- **Lectures réussies/échouées** par heure
- **Temps de réponse** moyen
- **Utilisation mémoire/CPU**
- **Erreurs** par type

### Interface de Monitoring
- **Graphiques en temps réel**
- **Alertes configurables**
- **Export des statistiques**
- **Historique des performances**

## 🔄 Mises à Jour

### Automatiques
- **Vérification quotidienne** des mises à jour
- **Installation silencieuse** des correctifs
- **Redémarrage automatique** si nécessaire

### Manuelles
- **Téléchargement** depuis le portail
- **Installation** via l'interface
- **Sauvegarde** automatique de la configuration

## 📞 Support

### Documentation
- **Guide utilisateur** complet
- **API Reference** détaillée
- **FAQ** des problèmes courants

### Contact
- **Email** : support@ophtalmo-pro.be
- **Téléphone** : +32 2 XXX XX XX
- **Tickets** : Via portail client

## 🚀 Roadmap

### Version 1.1
- [ ] Support lecteurs sans contact
- [ ] Interface web de configuration
- [ ] Intégration Active Directory

### Version 1.2
- [ ] Support multi-cartes simultanées
- [ ] API GraphQL
- [ ] Clustering pour haute disponibilité

### Version 2.0
- [ ] Support cartes européennes
- [ ] Authentification biométrique
- [ ] Cloud sync des configurations

---

**Cette application bridge résout définitivement les problèmes de compatibilité VMware tout en offrant une sécurité et une fiabilité maximales.**