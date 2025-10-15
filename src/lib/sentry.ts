/**
 * Sentry Configuration for BCI Frontend
 * Automatic error tracking for React + Apollo Client
 */
import * as Sentry from '@sentry/react';
import React from 'react';

export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('⚠️  VITE_SENTRY_DSN not set - Error tracking disabled');
    console.warn('   Pour activer Sentry :');
    console.warn('   1. Crée un projet React sur https://sentry.io');
    console.warn('   2. Ajoute VITE_SENTRY_DSN dans .env.local');
    console.warn('   3. Ajoute VITE_SENTRY_DSN dans Vercel Environment Variables');
    return false;
  }

  Sentry.init({
    dsn: sentryDsn,

    // Intégrations React + Browser
    integrations: [
      // Browser tracing
      Sentry.browserTracingIntegration(),

      // React component tracking
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
      }),

      // Replay sessions (voir les actions utilisateur)
      Sentry.replayIntegration({
        maskAllText: false, // Masquer le texte sensible
        blockAllMedia: false,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0, // 100% en dev/staging

    // Session Replay (voir ce que l'utilisateur a fait avant l'erreur)
    replaysSessionSampleRate: 0.1, // 10% des sessions normales
    replaysOnErrorSampleRate: 1.0,  // 100% des sessions avec erreur

    // Environment
    environment: import.meta.env.MODE, // 'development' ou 'production'

    // Release tracking
    release: 'bci-frontend@1.0.0',

    // Tags
    initialScope: {
      tags: {
        service: 'bci-frontend',
        platform: 'vercel',
      },
    },

    // Ignore specific errors
    ignoreErrors: [
      // Erreurs browser communes non critiques
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],

    // Capture console errors
    beforeSend(event, hint) {
      // Log en console en dev
      if (import.meta.env.DEV) {
        console.error('[Sentry]', hint.originalException || hint.syntheticException);
      }
      return event;
    },
  });

  console.log('✅ Sentry initialized (Frontend)');
  return true;
}

/**
 * Capture une erreur manuellement avec contexte
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture un message (pas une erreur)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureMessage(message, level);
}

/**
 * Set user info pour tracking
 */
export function setUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user (logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

// Export Sentry namespace pour usage avancé
export { Sentry };
