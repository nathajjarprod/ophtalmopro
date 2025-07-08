# Guide d'Intégration itsme pour OphtalmoPro

## 🚀 Introduction

**itsme** est le service d'identité numérique officiel belge qui permet une authentification sécurisée et la récupération automatique des données d'identité sans lecteur de cartes physique.

## ✅ Avantages par rapport à la carte eID

### Problèmes résolus
- ❌ **Lecteurs de cartes** : Plus besoin de matériel spécialisé
- ❌ **Compatibilité VMware** : Fini les problèmes USB/VM
- ❌ **Middleware complexe** : Plus d'installation de logiciels tiers
- ❌ **Cartes défectueuses** : Plus de problèmes de lecture physique

### Bénéfices itsme
- ✅ **Universel** : Fonctionne sur mobile, tablette, ordinateur
- ✅ **Moderne** : Interface utilisateur intuitive
- ✅ **Fiable** : Service maintenu par les autorités belges
- ✅ **Sécurisé** : Authentification forte avec biométrie
- ✅ **Rapide** : Authentification en quelques secondes
- ✅ **Toujours à jour** : Données synchronisées automatiquement

## 🔧 Configuration Technique

### 1. Prérequis

#### A. Inscription Développeur itsme
1. **Créer un compte** sur le portail développeur itsme
2. **Demander l'accès** aux APIs d'identité
3. **Obtenir les credentials** (Client ID, Client Secret)
4. **Configurer les URLs** de redirection

#### B. Variables d'Environnement
```bash
# Fichier .env
VITE_ITSME_CLIENT_ID=your_client_id_here
VITE_ITSME_CLIENT_SECRET=your_client_secret_here
VITE_ITSME_ENVIRONMENT=sandbox  # ou 'production'
```

### 2. Flux d'Authentification

#### A. Processus Standard
```
1. Utilisateur clique "Authentifier avec itsme"
2. Redirection vers itsme avec paramètres sécurisés
3. Utilisateur s'authentifie sur son mobile itsme
4. itsme redirige avec code d'autorisation
5. Échange du code contre un token d'accès
6. Récupération des données utilisateur
7. Remplissage automatique du formulaire patient
```

#### B. Sécurité
- **State parameter** : Protection CSRF
- **Nonce** : Protection replay attacks
- **HTTPS obligatoire** : Chiffrement des communications
- **Tokens temporaires** : Expiration automatique

## 📱 Interface Utilisateur

### 1. Bouton d'Authentification

Le composant `ItsmeAuthButton` offre :
- **Design officiel itsme** (couleurs, logo)
- **États visuels** (disponible, chargement, erreur)
- **Mode démonstration** si service indisponible
- **Informations contextuelles** pour l'utilisateur

### 2. Expérience Utilisateur

#### Flux Normal
1. **Clic sur bouton itsme** → Ouverture popup
2. **Scan QR code** avec app itsme mobile
3. **Authentification biométrique** sur mobile
4. **Validation** → Données récupérées automatiquement
5. **Formulaire pré-rempli** → Utilisateur vérifie et valide

#### Mode Démonstration
- **Simulation complète** pour développement/tests
- **Données fictives réalistes** 
- **Même interface** que le mode production
- **Activation automatique** si service indisponible

## 🔒 Données Récupérées

### Informations Standard
```typescript
interface ItsmeUserData {
  firstName: string;        // Prénom officiel
  lastName: string;         // Nom de famille officiel
  dateOfBirth: string;      // Date de naissance (DD/MM/YYYY)
  placeOfBirth?: string;    // Lieu de naissance
  nationality?: string;     // Nationalité
  niss: string;            // Numéro national formaté
  address?: {              // Adresse officielle
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  phone?: string;          // Téléphone (si autorisé)
  email?: string;          // Email (si autorisé)
  photo?: string;          // Photo (si autorisée)
}
```

### Scopes Demandés
- `openid` : Identifiant unique
- `profile` : Nom, prénom, date de naissance
- `eid` : Données carte d'identité (NISS, etc.)
- `address` : Adresse officielle
- `phone` : Numéro de téléphone
- `email` : Adresse email

## 🏥 Intégration dans OphtalmoPro

### 1. Sélection de Méthode

L'utilisateur peut choisir entre :
- **itsme** (recommandé) : Moderne, fiable, universel
- **Carte eID** (legacy) : Pour compatibilité existante

### 2. Remplissage Automatique

Après authentification itsme :
- **Tous les champs** sont pré-remplis automatiquement
- **Validation** des données par l'utilisateur
- **Modification possible** si nécessaire
- **Sauvegarde** dans la base de données

### 3. Gestion d'Erreurs

#### Erreurs Possibles
- **Service indisponible** → Mode démonstration
- **Authentification annulée** → Message informatif
- **Données incomplètes** → Saisie manuelle complémentaire
- **Erreur réseau** → Retry automatique

#### Messages Utilisateur
- **Clairs et informatifs** en français
- **Actions suggérées** pour résoudre
- **Fallback** vers saisie manuelle

## 🚀 Déploiement Production

### 1. Configuration Serveur

#### Variables d'Environnement Production
```bash
VITE_ITSME_CLIENT_ID=prod_client_id
VITE_ITSME_CLIENT_SECRET=prod_client_secret
VITE_ITSME_ENVIRONMENT=production
```

#### URLs de Redirection
- **Production** : `https://votre-domaine.be/itsme/callback`
- **Staging** : `https://staging.votre-domaine.be/itsme/callback`

### 2. Certificats SSL

**HTTPS obligatoire** pour itsme :
- **Certificat valide** (pas auto-signé)
- **Domaine vérifié** dans le portail itsme
- **Redirection HTTP → HTTPS** configurée

### 3. Monitoring

#### Métriques à Surveiller
- **Taux de succès** authentification
- **Temps de réponse** API itsme
- **Erreurs** par type
- **Utilisation** vs carte eID

#### Alertes
- **Service itsme indisponible** → Notification admin
- **Taux d'erreur élevé** → Investigation
- **Performance dégradée** → Optimisation

## 🧪 Tests et Validation

### 1. Environnement Sandbox

itsme fournit un **environnement de test** :
- **Données fictives** mais réalistes
- **Même API** que la production
- **Tests complets** sans impact réel

### 2. Tests Automatisés

```typescript
// Exemple de test
describe('itsme Integration', () => {
  it('should authenticate and retrieve user data', async () => {
    const userData = await itsmeService.simulateAuthentication();
    expect(userData.firstName).toBeDefined();
    expect(userData.niss).toMatch(/^\d{2}\.\d{2}\.\d{2}-\d{3}\.\d{2}$/);
  });
});
```

### 3. Tests Manuels

#### Checklist de Validation
- [ ] Bouton itsme s'affiche correctement
- [ ] Popup d'authentification s'ouvre
- [ ] QR code scannable avec app itsme
- [ ] Données récupérées et formatées
- [ ] Formulaire pré-rempli correctement
- [ ] Gestion d'erreurs fonctionnelle
- [ ] Mode démonstration opérationnel

## 📞 Support et Maintenance

### 1. Documentation Officielle
- **Portail développeur** : https://belgianmobileid.github.io/doc/
- **API Reference** : Documentation OpenID Connect
- **Support technique** : Via portail développeur

### 2. Dépannage Courant

#### "Service itsme indisponible"
- **Vérifier** connectivité internet
- **Tester** URL sandbox/production
- **Consulter** status page itsme
- **Activer** mode démonstration temporairement

#### "Authentification échouée"
- **Vérifier** configuration client ID/secret
- **Contrôler** URLs de redirection
- **Valider** certificats SSL
- **Tester** avec compte sandbox

### 3. Évolutions Futures

#### Fonctionnalités Prévues
- **Authentification périodique** pour sécurité
- **Mise à jour automatique** des données patient
- **Intégration** avec d'autres services eHealth
- **Support** nouveaux scopes itsme

## 🎯 Recommandations

### 1. Migration Progressive
1. **Déployer itsme** en parallèle de la carte eID
2. **Former les utilisateurs** sur itsme
3. **Monitorer l'adoption** et les retours
4. **Optimiser** l'expérience utilisateur
5. **Déprécier** progressivement la carte eID

### 2. Communication Utilisateurs
- **Expliquer les avantages** d'itsme
- **Rassurer sur la sécurité** des données
- **Fournir un support** pour l'installation app
- **Maintenir** l'option carte eID temporairement

### 3. Sécurité
- **Auditer** régulièrement l'intégration
- **Mettre à jour** les dépendances
- **Surveiller** les vulnérabilités
- **Former** l'équipe sur les bonnes pratiques

---

**itsme représente l'avenir de l'authentification en Belgique. Cette intégration positionne OphtalmoPro comme une solution moderne et innovante pour les cabinets d'ophtalmologie.**