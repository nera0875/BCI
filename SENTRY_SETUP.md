# 🚨 Configuration Sentry - BCI Frontend (Vercel)

## Étapes pour activer Sentry (Gratuit)

### 1. Créer un projet React sur Sentry
1. Va sur https://sentry.io (même compte que backend)
2. Clique sur "Create Project"
3. Sélectionne "React"
4. Nom du projet : **BCI-Frontend**
5. Clique sur "Create Project"

### 2. Copier le DSN Frontend
Tu vas voir un DSN différent du backend :
```
https://XXXXXXXXXXXXX@YYYYYY.ingest.sentry.io/ZZZZZZZ
```

**Attention** : Le DSN frontend est différent du DSN backend !

### 3. Configurer Vercel Environment Variables
1. Va sur https://vercel.com/dashboard
2. Ouvre ton projet **BCI**
3. Settings → Environment Variables
4. Ajoute :
   - **Name**: `VITE_SENTRY_DSN`
   - **Value**: `https://XXX@YYY.ingest.sentry.io/ZZZ` (ton DSN frontend)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development

5. Clique sur "Save"

### 4. Redéployer sur Vercel
```bash
cd /home/pilote/projet/BCI/frontend
git add .
git commit -m "feat: Add Sentry error tracking"
git push
```

Vercel va automatiquement redéployer avec Sentry activé ! 🎉

### 5. Tester localement (optionnel)
```bash
cd /home/pilote/projet/BCI/frontend

# Crée un fichier .env.local
echo 'VITE_SENTRY_DSN="ton_dsn_frontend_ici"' > .env.local

# Redémarre le dev server
npm run dev
```

---

## 📧 Configurer les alertes

Dans Sentry Frontend :
1. **Settings** → **Alerts**
2. Crée une règle : **"When a new issue is created"**
3. Action : **Send notification to email**
4. Active : **Instant notifications**

---

## 🎬 Session Replay

Sentry enregistre automatiquement les sessions où une erreur se produit. Tu verras :
- ✅ Vidéo de ce que l'utilisateur a fait
- ✅ Clics, scrolls, inputs
- ✅ Console logs
- ✅ Network requests (GraphQL queries)

C'est comme un enregistrement d'écran automatique ! 🎥

---

## 📊 Ce que tu verras

**Erreurs Frontend détectées automatiquement :**
- ❌ Erreurs GraphQL (query failed, network error)
- ❌ Erreurs React (component crashes)
- ❌ Erreurs JavaScript (undefined, null reference)
- ❌ Erreurs de parsing (JSON.parse failed)

**Performance :**
- ⚡ Temps de chargement des pages
- ⚡ Temps de réponse GraphQL
- ⚡ Render times React

Plus besoin de vérifier la console manuellement ! 🚀
