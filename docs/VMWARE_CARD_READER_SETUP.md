# Configuration Lecteur de Cartes eID dans VMware Workstation

## 🖥️ Problème Spécifique VMware

Vous avez un lecteur "Alcor Micro USB Smart Card Reader" connecté à votre VM VMware mais le système ne le détecte pas pour la lecture eID.

## 🔧 Solution Étape par Étape

### 1. Configuration VMware Workstation

#### A. Configuration USB de la VM
1. **Arrêter la VM** complètement
2. **VM Settings** → **Hardware** → **USB Controller**
3. **Supprimer** l'USB Controller existant
4. **Add** → **USB Controller** → Sélectionner **USB 3.1**
5. Cocher **"Show all USB input devices"**
6. **OK** pour sauvegarder

#### B. Connexion du Lecteur
1. **Démarrer la VM**
2. **Connecter physiquement** le lecteur USB à l'hôte
3. **VM** → **Removable Devices** → **Alcor Micro USB Smart Card Reader**
4. Sélectionner **"Connect (Disconnect from Host)"**
5. ⚠️ **Important**: Le lecteur doit disparaître de l'hôte et apparaître dans la VM

### 2. Vérification dans Windows (VM)

#### A. Gestionnaire de Périphériques
1. **Clic droit** sur "Ce PC" → **Gérer** → **Gestionnaire de périphériques**
2. Développer **"Lecteurs de cartes à puce"**
3. Vous devriez voir : **"Alcor Micro USB Smart Card Reader"**
4. **Clic droit** → **Propriétés** → Vérifier **"Le périphérique fonctionne correctement"**

#### B. Services Windows
1. **Win + R** → `services.msc`
2. Vérifier ces services sont **"Démarrés"** :
   - **Smart Card** (SCardSvr)
   - **Smart Card Device Enumeration Service** (ScDeviceEnum)
   - **Smart Card Removal Policy** (SCPolicySvc)
3. Si arrêtés : **Clic droit** → **Démarrer**

### 3. Installation/Réinstallation Middleware eID

#### A. Désinstallation Propre (si déjà installé)
1. **Panneau de configuration** → **Programmes** → **Désinstaller**
2. Supprimer **"Belgium eID Middleware"** ou **"eID Software"**
3. **Redémarrer la VM**

#### B. Installation Complète
1. **Télécharger** depuis : https://eid.belgium.be/fr/middleware-eid
2. **Clic droit** sur l'installateur → **"Exécuter en tant qu'administrateur"**
3. Choisir **"Installation complète"** avec tous les composants
4. **Redémarrer la VM** après installation

### 4. Test de Fonctionnement

#### A. Test avec eID Viewer
1. **Insérer** votre carte eID dans le lecteur
2. Lancer **"eID Viewer"** (dans le menu Démarrer)
3. La carte doit être **lue automatiquement**
4. ✅ **Si ça fonctionne** : Le lecteur est correctement configuré

#### B. Test avec l'Application Web
1. Ouvrir votre application OphtalmoPro
2. **Nouveau patient** → **"Lire carte eID"**
3. Utiliser le bouton **"Diagnostic VMware"** pour plus d'infos

## 🚨 Dépannage Avancé

### Problème : Lecteur non visible dans la VM

**Solutions :**
1. **USB 2.0 au lieu de 3.1** : Certains lecteurs fonctionnent mieux en USB 2.0
2. **VMware Tools** : Vérifier que VMware Tools est installé et à jour
3. **Redirection USB** : VM → Settings → Options → USB → "Share Bluetooth devices with the virtual machine"

### Problème : eID Viewer ne fonctionne pas

**Solutions :**
1. **Pilotes** : Télécharger les pilotes Alcor Micro spécifiques
2. **Compatibilité** : Essayer en mode compatibilité Windows 10
3. **Antivirus** : Désactiver temporairement l'antivirus

### Problème : API REST ne répond pas

**Solutions :**
1. **Port** : Vérifier que le port 53001 n'est pas bloqué
2. **Pare-feu** : Ajouter une exception pour le middleware eID
3. **Service** : Redémarrer les services Smart Card

## 📋 Commandes de Diagnostic

### Vérification USB
```cmd
# Lister les périphériques USB
wmic path Win32_USBControllerDevice get Dependent

# Vérifier les services Smart Card
sc query SCardSvr
sc query ScDeviceEnum
sc query SCPolicySvc
```

### Vérification Réseau
```cmd
# Vérifier si le middleware écoute
netstat -an | findstr :53001
netstat -an | findstr :35963

# Tester la connexion
curl http://localhost:53001/service/info
```

## ✅ Checklist de Validation

- [ ] Lecteur visible dans Gestionnaire de périphériques
- [ ] Services Smart Card démarrés
- [ ] eID Viewer lit la carte correctement
- [ ] Middleware eID installé en mode administrateur
- [ ] VM redémarrée après installation
- [ ] USB passthrough configuré dans VMware
- [ ] Carte eID insérée et reconnue
- [ ] Application web peut accéder au middleware

## 🆘 Support

Si le problème persiste :
1. **Tester sur l'hôte physique** d'abord
2. **Contacter le support VMware** pour les problèmes USB
3. **Contacter Fedict** pour les problèmes middleware eID
4. **Utiliser le mode simulation** en attendant la résolution

---

**Note** : La configuration VMware peut être délicate. Il est souvent plus simple de tester d'abord sur un système physique pour valider que tout fonctionne, puis de reproduire dans la VM.