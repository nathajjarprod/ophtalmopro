/**
 * Configuration spécifique pour l'environnement de production
 */

export const PRODUCTION_CONFIG = {
  // Configuration eID
  EID_MIDDLEWARE_PORT: 53001,
  EID_MIDDLEWARE_HOST: 'localhost',
  EID_TIMEOUT: 60000, // 1 minute en production
  EID_RETRY_ATTEMPTS: 3,
  EID_RETRY_DELAY: 2000,

  // Sécurité
  ENABLE_SIMULATION: false, // Jamais de simulation en production
  REQUIRE_HTTPS: true,
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'error', // Seulement les erreurs en production

  // Monitoring
  HEALTH_CHECK_INTERVAL: 60000, // Vérification chaque minute
  ENABLE_MONITORING: true,
  ALERT_ON_MIDDLEWARE_DOWN: true,

  // Base de données
  DB_BACKUP_INTERVAL: 3600000, // Sauvegarde chaque heure
  ENABLE_AUTO_BACKUP: true,

  // Interface utilisateur
  SHOW_DEBUG_INFO: false,
  ENABLE_DEV_TOOLS: false,
  AUTO_UPDATE_CHECK: true
};

export const DEVELOPMENT_CONFIG = {
  // Configuration eID
  EID_MIDDLEWARE_PORT: 53001,
  EID_MIDDLEWARE_HOST: 'localhost',
  EID_TIMEOUT: 30000,
  EID_RETRY_ATTEMPTS: 1,
  EID_RETRY_DELAY: 1000,

  // Sécurité
  ENABLE_SIMULATION: true, // Simulation autorisée en dev
  REQUIRE_HTTPS: false,
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'debug',

  // Monitoring
  HEALTH_CHECK_INTERVAL: 30000,
  ENABLE_MONITORING: false,
  ALERT_ON_MIDDLEWARE_DOWN: false,

  // Base de données
  DB_BACKUP_INTERVAL: 0, // Pas de sauvegarde auto en dev
  ENABLE_AUTO_BACKUP: false,

  // Interface utilisateur
  SHOW_DEBUG_INFO: true,
  ENABLE_DEV_TOOLS: true,
  AUTO_UPDATE_CHECK: false
};

export const getConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
};

export const isProductionEnvironment = () => {
  return process.env.NODE_ENV === 'production';
};

export const validateProductionEnvironment = async () => {
  if (!isProductionEnvironment()) {
    console.log('🔧 Mode développement - Validation ignorée');
    return true;
  }

  console.log('🏥 Validation de l\'environnement de production...');

  const checks = [
    {
      name: 'Middleware eID',
      check: async () => {
        try {
          const response = await fetch('http://localhost:53001/service/info', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
          });
          return response.ok;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'HTTPS requis',
      check: () => {
        return location.protocol === 'https:' || location.hostname === 'localhost';
      }
    },
    {
      name: 'Lecteur de cartes',
      check: async () => {
        try {
          const response = await fetch('http://localhost:53001/readers');
          if (response.ok) {
            const readers = await response.json();
            return Array.isArray(readers) && readers.length > 0;
          }
          return false;
        } catch {
          return false;
        }
      }
    }
  ];

  const results = await Promise.all(
    checks.map(async (check) => ({
      name: check.name,
      passed: await check.check()
    }))
  );

  const failed = results.filter(r => !r.passed);
  
  if (failed.length > 0) {
    const failedNames = failed.map(f => f.name).join(', ');
    throw new Error(
      `❌ Validation de production échouée: ${failedNames}\n\n` +
      'Vérifiez la documentation de déploiement pour résoudre ces problèmes.'
    );
  }

  console.log('✅ Environnement de production validé');
  return true;
};