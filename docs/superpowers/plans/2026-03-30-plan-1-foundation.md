# Home Manager — Plan 1 : Foundation

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Déployer une app React + Firebase où Yves et Enza peuvent se connecter et voir le dashboard avec 8 cartes de modules.

**Architecture:** Vite React SPA + Firebase Auth/Firestore/Hosting. `AuthContext` fournit l'état auth global. React Router gère le routing login ↔ dashboard. Les modules sont des stubs vides pour l'instant.

**Tech Stack:** React 18, Vite 5, Firebase 10, React Router 6, Vitest, @testing-library/react, @testing-library/jest-dom

---

## Structure des fichiers

```
home-manager/
├── .github/workflows/deploy.yml     ← CI/CD Firebase Hosting sur push main
├── public/
│   └── firebase-messaging-sw.js     ← Service Worker FCM (stub vide pour l'instant)
├── src/
│   ├── main.jsx                     ← Point d'entrée React
│   ├── App.jsx                      ← Router : /login ↔ / (dashboard)
│   ├── firebase.js                  ← Init Firebase + exports auth, db
│   ├── contexts/
│   │   └── AuthContext.jsx          ← Provider auth + profil utilisateur Firestore
│   ├── pages/
│   │   ├── LoginPage.jsx            ← Formulaires connexion / création de compte
│   │   └── DashboardPage.jsx        ← Grille 2×4 des 8 modules
│   ├── components/
│   │   ├── ModuleCard.jsx           ← Carte d'un module (icône, titre, résumé, badge)
│   │   └── AlertBanner.jsx          ← Bandeau d'alerte en haut du dashboard
│   └── styles/
│       ├── global.css               ← Variables CSS, reset, police Nunito
│       ├── login.css                ← Styles LoginPage
│       └── dashboard.css            ← Styles DashboardPage + ModuleCard
├── tests/
│   ├── setup.js                     ← Vitest setup, mock Firebase
│   ├── AuthContext.test.jsx
│   ├── LoginPage.test.jsx
│   ├── ModuleCard.test.jsx
│   └── DashboardPage.test.jsx
├── firestore.rules                  ← Règles de sécurité Firestore
├── .firebaserc                      ← ID du projet Firebase
├── firebase.json                    ← Config Firebase Hosting
├── .env.example                     ← Template variables d'env (commité)
├── .env.local                       ← Vraies clés Firebase (gitignored)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Chunk 1 : Setup + Configuration

### Task 1 : Initialiser le projet Vite + React

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

- [ ] **Step 1 : Créer le projet Vite React dans le dossier existant**

```bash
cd "C:/Users/Sekai/OneDrive/Documents/Claude-projets/home-manager"
npm create vite@latest . -- --template react
```

Répondre `y` si demande de confirmation (fichiers existants ignorés).

Expected output: `✔ Done. Now run: npm install`

- [ ] **Step 2 : Installer toutes les dépendances**

```bash
npm install
npm install firebase react-router-dom
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected output: `added N packages` sans erreur.

- [ ] **Step 3 : Configurer Vite + Vitest**

Remplacer le contenu de `vite.config.js` :

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
```

- [ ] **Step 4 : Créer le fichier de setup des tests**

Créer `tests/setup.js` :

```js
import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('../src/firebase.js', () => ({
  auth: {},
  db: {},
}))
```

- [ ] **Step 5 : Mettre à jour package.json pour ajouter le script test**

Dans `package.json`, ajouter dans `"scripts"` :

```json
"test": "vitest",
"test:run": "vitest run",
"coverage": "vitest run --coverage"
```

- [ ] **Step 6 : Lancer les tests pour vérifier la config**

```bash
npm run test:run
```

Expected output: `No test files found` (normal, pas encore de tests).

- [ ] **Step 7 : Commit**

```bash
git add package.json package-lock.json vite.config.js tests/setup.js
git commit -m "feat: initialize Vite React project with Firebase and Vitest"
```

---

### Task 2 : Configuration Firebase

**Files:**
- Create: `src/firebase.js`, `.env.example`, `.env.local` (manuel), `.gitignore`

- [ ] **Step 1 : Mettre à jour .gitignore**

Créer/remplacer `.gitignore` :

```
# Dependencies
node_modules/

# Build
dist/

# Environment
.env.local
.env.*.local

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log

# IDE
.vscode/
.idea/

# Superpowers brainstorm
.superpowers/
```

- [ ] **Step 2 : Créer le template des variables d'environnement**

Créer `.env.example` :

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

- [ ] **Step 3 : ⚠️ ÉTAPE MANUELLE — Créer .env.local avec les vraies clés**

Dans la console Firebase (console.firebase.google.com) :
1. Ouvrir ton projet
2. Cliquer sur l'icône ⚙️ → Paramètres du projet
3. Onglet "Général" → section "Vos applications" → ajouter une app Web (icône `</>`)
4. Copier les valeurs de `firebaseConfig`
5. Créer `.env.local` à la racine du projet et y coller les valeurs :

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=home-manager-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=home-manager-xxx
VITE_FIREBASE_STORAGE_BUCKET=home-manager-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

- [ ] **Step 4 : Créer src/firebase.js**

```js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

- [ ] **Step 5 : Activer Email/Password dans Firebase Auth**

⚠️ ÉTAPE MANUELLE — Dans la console Firebase :
1. Aller dans "Authentication" → "Sign-in method"
2. Activer "Email/mot de passe"
3. Sauvegarder

- [ ] **Step 6 : Commit**

```bash
git add src/firebase.js .env.example .gitignore
git commit -m "feat: add Firebase config and environment setup"
```

---

### Task 3 : Règles de sécurité Firestore

**Files:**
- Create: `firestore.rules`, `firebase.json`, `.firebaserc`

- [ ] **Step 1 : Créer firestore.rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isMembre(foyerId) {
      return request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/foyers/$(foyerId)).data.membres;
    }

    // Profil utilisateur : lecture/écriture uniquement par le propriétaire
    match /utilisateurs/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Foyers : lisible/modifiable par les membres
    match /foyers/{foyerId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.membres;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.membres;
    }

    // Toutes les autres collections : vérifier l'appartenance au foyer
    match /{collection}/{docId} {
      allow read, write: if request.auth != null &&
        isMembre(resource.data.foyerId);
      allow create: if request.auth != null &&
        isMembre(request.resource.data.foyerId);
    }
  }
}
```

- [ ] **Step 2 : Créer firebase.json**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

- [ ] **Step 3 : Créer .firebaserc**

Remplacer `YOUR_PROJECT_ID` par l'ID réel (visible dans `.env.local`) :

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

- [ ] **Step 4 : Commit**

```bash
git add firestore.rules firebase.json .firebaserc
git commit -m "feat: add Firestore security rules and Firebase hosting config"
```

---

### Task 4 : GitHub Actions — Deploy automatique

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1 : ⚠️ ÉTAPE MANUELLE — Générer le Service Account Firebase**

Dans la console Firebase :
1. ⚙️ Paramètres → "Comptes de service"
2. Cliquer "Générer une nouvelle clé privée" → télécharger le JSON
3. Dans ton repo GitHub → Settings → Secrets and variables → Actions
4. Créer un secret nommé `FIREBASE_SERVICE_ACCOUNT` avec le contenu du JSON

- [ ] **Step 2 : Créer le workflow de déploiement**

Créer `.github/workflows/deploy.yml` (remplacer `YOUR_PROJECT_ID`) :

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: YOUR_PROJECT_ID   # TODO: remplacer par VITE_FIREBASE_PROJECT_ID
          channelId: live
```

- [ ] **Step 3 : ⚠️ ÉTAPE MANUELLE — Ajouter les variables Firebase comme secrets GitHub**

Dans GitHub → Settings → Secrets → Actions, créer un secret pour chacune des variables :
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

- [ ] **Step 4 : Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions CI/CD pipeline for Firebase Hosting"
```

---

## Chunk 2 : Authentification

### Task 5 : Global CSS + Design System

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/main.jsx`

- [ ] **Step 1 : Créer global.css**

```css
/* src/styles/global.css */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

:root {
  --bg-base: #0d0d1a;
  --bg-card: #12121f;
  --bg-input: #1a1a2e;
  --border: #1e1e3a;
  --border-card: #22224a;
  --text-primary: #f0f0ff;
  --text-secondary: #a0a0c0;
  --text-muted: #505080;
  --color-yves: #2563eb;
  --color-yves-light: #60a5fa;
  --color-enza: #16a34a;
  --color-enza-light: #4ade80;
  --color-alert: #ef4444;
  --color-alert-light: #f87171;
  --color-warn: #f59e0b;
  --radius-card: 18px;
  --radius-input: 12px;
  --radius-pill: 20px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Nunito', sans-serif;
  background-color: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button {
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
}

input, textarea {
  font-family: 'Nunito', sans-serif;
}
```

- [ ] **Step 2 : Importer global.css dans main.jsx**

```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3 : Commit**

```bash
git add src/styles/global.css src/main.jsx
git commit -m "feat: add global CSS design system with dark theme and color tokens"
```

---

### Task 6 : AuthContext

**Files:**
- Create: `src/contexts/AuthContext.jsx`, `tests/AuthContext.test.jsx`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `tests/AuthContext.test.jsx` :

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../src/contexts/AuthContext'

// Mock Firebase Auth
vi.mock('../src/firebase.js', () => ({
  auth: {},
  db: {},
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null) // utilisateur non connecté par défaut
    return vi.fn() // unsubscribe
  }),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}))

function TestConsumer() {
  const { user, profile, loading } = useAuth()
  if (loading) return <div>loading</div>
  return (
    <div>
      <span data-testid="user">{user ? 'connected' : 'disconnected'}</span>
      <span data-testid="profile">{profile ? profile.nom : 'no-profile'}</span>
    </div>
  )
}

describe('AuthContext', () => {
  it('provides disconnected state when no user is logged in', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('disconnected')
      expect(screen.getByTestId('profile').textContent).toBe('no-profile')
    })
  })

  it('shows loading state initially', () => {
    // Reconfigurer le mock pour ne jamais appeler le callback
    const { onAuthStateChanged } = await import('firebase/auth')
    vi.mocked(onAuthStateChanged).mockImplementationOnce(() => vi.fn())
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    expect(screen.getByText('loading')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
npm run test:run -- tests/AuthContext.test.jsx
```

Expected: FAIL — `AuthContext` not found

- [ ] **Step 3 : Implémenter AuthContext**

Créer `src/contexts/AuthContext.jsx` :

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'utilisateurs', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
        setUser(firebaseUser)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
npm run test:run -- tests/AuthContext.test.jsx
```

Expected: `2 tests passed`

- [ ] **Step 5 : Commit**

```bash
git add src/contexts/AuthContext.jsx tests/AuthContext.test.jsx
git commit -m "feat: add AuthContext with Firebase Auth and Firestore profile"
```

---

### Task 7 : LoginPage

**Files:**
- Create: `src/pages/LoginPage.jsx`, `src/styles/login.css`, `tests/LoginPage.test.jsx`

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `tests/LoginPage.test.jsx` :

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../src/pages/LoginPage'

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'uid-yves' } })
  ),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'foyer-123' })),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  arrayUnion: vi.fn((v) => [v]),
  updateDoc: vi.fn(() => Promise.resolve()),
}))

describe('LoginPage', () => {
  it('renders connexion tab by default', () => {
    render(<LoginPage />)
    expect(screen.getByText('Connexion')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
  })

  it('switches to signup tab when clicked', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('Créer un compte'))
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument()
  })

  it('shows error on empty login submit', async () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('shows color picker on signup tab', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByText('Créer un compte'))
    expect(screen.getByText(/couleur/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

```bash
npm run test:run -- tests/LoginPage.test.jsx
```

Expected: FAIL — `LoginPage` not found

- [ ] **Step 3 : Créer login.css**

```css
/* src/styles/login.css */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--bg-base);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-card);
  border-radius: 24px;
  padding: 2rem 1.5rem;
  border: 1.5px solid var(--border);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.login-logo {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.login-title {
  text-align: center;
  font-size: 1.3rem;
  font-weight: 900;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.login-tabs {
  display: flex;
  background: var(--bg-input);
  border-radius: var(--radius-pill);
  padding: 4px;
  margin-bottom: 1.5rem;
}

.login-tab {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-muted);
  transition: all 0.2s;
}

.login-tab.active {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.login-field {
  margin-bottom: 1rem;
}

.login-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.4rem;
}

.login-input {
  width: 100%;
  background: var(--bg-input);
  border: 1.5px solid var(--border-card);
  border-radius: var(--radius-input);
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.login-input:focus {
  border-color: var(--color-yves);
}

.color-picker {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
}

.color-swatch:hover { transform: scale(1.15); }
.color-swatch.selected { border-color: #fff; transform: scale(1.2); }

.foyer-toggle {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.foyer-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 10px;
  background: var(--bg-input);
  border: 1.5px solid var(--border-card);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--text-muted);
  transition: all 0.15s;
}

.foyer-btn.active {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.5);
  color: var(--color-yves-light);
}

.login-btn {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, var(--color-yves), var(--color-yves-light));
  border: none;
  border-radius: var(--radius-input);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 900;
  margin-top: 1.2rem;
  letter-spacing: 0.03em;
  transition: opacity 0.2s;
}

.login-btn:hover { opacity: 0.9; }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.login-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-alert-light);
  margin-top: 0.8rem;
}

.foyer-code-display {
  background: rgba(22, 163, 74, 0.1);
  border: 1.5px solid rgba(22, 163, 74, 0.4);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin-top: 1rem;
}

.foyer-code-display p {
  font-size: 0.78rem;
  color: var(--color-enza-light);
  margin-bottom: 0.4rem;
  font-weight: 700;
}

.foyer-code-value {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--color-enza-light);
  letter-spacing: 0.1em;
}
```

- [ ] **Step 4 : Implémenter LoginPage**

Créer `src/pages/LoginPage.jsx` :

```jsx
import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import {
  doc, setDoc, addDoc, collection,
  serverTimestamp, arrayUnion, updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import '../styles/login.css'

const COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#ef4444',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316',
]

export default function LoginPage() {
  const [tab, setTab] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [couleur, setCouleur] = useState('#2563eb')
  const [foyerMode, setFoyerMode] = useState('create') // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newFoyerId, setNewFoyerId] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Remplis tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch {
      setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    if (!nom || !email || !password) {
      setError('Remplis tous les champs.')
      return
    }
    if (foyerMode === 'join' && !joinCode.trim()) {
      setError('Entre le code du foyer.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      let foyerId

      if (foyerMode === 'create') {
        const foyerRef = await addDoc(collection(db, 'foyers'), {
          membres: [user.uid],
          createdAt: serverTimestamp(),
        })
        foyerId = foyerRef.id
        setNewFoyerId(foyerId)
      } else {
        foyerId = joinCode.trim()
        await updateDoc(doc(db, 'foyers', foyerId), {
          membres: arrayUnion(user.uid),
        })
      }

      await setDoc(doc(db, 'utilisateurs', user.uid), {
        nom,
        couleur,
        foyerId,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏠</div>
        <h1 className="login-title">Home Manager</h1>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Connexion
          </button>
          <button
            className={`login-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Créer un compte
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="nom">Prénom</label>
              <input
                id="nom"
                className="login-input"
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
              />
            </div>
            <div className="login-field">
              <label className="login-label">Couleur</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${couleur === c ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setCouleur(c)}
                    aria-label={`couleur ${c}`}
                  />
                ))}
              </div>
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="email-signup">Email</label>
              <input
                id="email-signup"
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <label className="login-label" htmlFor="password-signup">Mot de passe</label>
              <input
                id="password-signup"
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="login-field">
              <label className="login-label">Foyer</label>
              <div className="foyer-toggle">
                <button
                  type="button"
                  className={`foyer-btn ${foyerMode === 'create' ? 'active' : ''}`}
                  onClick={() => setFoyerMode('create')}
                >
                  🏠 Créer un foyer
                </button>
                <button
                  type="button"
                  className={`foyer-btn ${foyerMode === 'join' ? 'active' : ''}`}
                  onClick={() => setFoyerMode('join')}
                >
                  🔗 Rejoindre
                </button>
              </div>
              {foyerMode === 'join' && (
                <input
                  className="login-input"
                  style={{ marginTop: '0.5rem' }}
                  type="text"
                  placeholder="Code du foyer"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                />
              )}
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            {newFoyerId && (
              <div className="foyer-code-display">
                <p>✅ Foyer créé ! Partage ce code avec ton/ta partenaire :</p>
                <div className="foyer-code-value">{newFoyerId}</div>
              </div>
            )}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5 : Lancer les tests**

```bash
npm run test:run -- tests/LoginPage.test.jsx
```

Expected: `4 tests passed`

- [ ] **Step 6 : Commit**

```bash
git add src/pages/LoginPage.jsx src/styles/login.css tests/LoginPage.test.jsx
git commit -m "feat: add LoginPage with login/signup forms and foyer creation"
```

---

### Task 8 : App.jsx — Routing

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1 : Implémenter App.jsx**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', fontSize: '2rem'
    }}>
      🏠
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 2 : Créer DashboardPage stub temporaire** (sera remplacé dans Chunk 3)

Créer `src/pages/DashboardPage.jsx` :

```jsx
export default function DashboardPage() {
  return <div data-testid="dashboard">Dashboard</div>
}
```

- [ ] **Step 3 : Lancer le build pour vérifier aucune erreur**

```bash
npm run build
```

Expected: `✓ built in Xs` sans erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/App.jsx src/pages/DashboardPage.jsx
git commit -m "feat: add React Router routing with protected/public routes"
```

---

## Chunk 3 : Dashboard

### Task 9 : ModuleCard

**Files:**
- Create: `src/components/ModuleCard.jsx`, `tests/ModuleCard.test.jsx`

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `tests/ModuleCard.test.jsx` :

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ModuleCard from '../src/components/ModuleCard'
import { MemoryRouter } from 'react-router-dom'

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('ModuleCard', () => {
  it('renders icon and name', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" />)
    expect(screen.getByText('🛒')).toBeInTheDocument()
    expect(screen.getByText('Courses')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" subtitle="5 articles" />)
    expect(screen.getByText('5 articles')).toBeInTheDocument()
  })

  it('renders badge when badge > 0', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" badge={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not render badge when badge is null', () => {
    wrap(<ModuleCard id="courses" icon="🛒" nom="Courses" path="/courses" badge={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer les tests pour vérifier qu'ils échouent**

```bash
npm run test:run -- tests/ModuleCard.test.jsx
```

Expected: FAIL — `ModuleCard` not found

- [ ] **Step 3 : Implémenter ModuleCard**

Créer `src/components/ModuleCard.jsx` :

```jsx
import { Link } from 'react-router-dom'

export default function ModuleCard({ id, icon, nom, path, subtitle, badge, variant }) {
  return (
    <Link to={path} className={`module-card ${variant ? `module-card--${variant}` : ''}`}>
      {badge != null && badge > 0 && (
        <span className="module-card__badge" role="status">{badge}</span>
      )}
      <span className="module-card__icon">{icon}</span>
      <span className="module-card__name">{nom}</span>
      {subtitle && (
        <span className={`module-card__subtitle ${variant ? `module-card__subtitle--${variant}` : ''}`}>
          {subtitle}
        </span>
      )}
    </Link>
  )
}
```

- [ ] **Step 4 : Lancer les tests pour vérifier qu'ils passent**

```bash
npm run test:run -- tests/ModuleCard.test.jsx
```

Expected: `4 tests passed`

- [ ] **Step 5 : Commit**

```bash
git add src/components/ModuleCard.jsx tests/ModuleCard.test.jsx
git commit -m "feat: add ModuleCard component with badge and variant support"
```

---

### Task 10 : AlertBanner

**Files:**
- Create: `src/components/AlertBanner.jsx`, `tests/AlertBanner.test.jsx`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `tests/AlertBanner.test.jsx` :

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlertBanner from '../src/components/AlertBanner'

describe('AlertBanner', () => {
  it('renders the message when provided', () => {
    render(<AlertBanner message="2 produits expirent bientôt" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('2 produits expirent bientôt')).toBeInTheDocument()
  })

  it('renders nothing when message is null', () => {
    const { container } = render(<AlertBanner message={null} />)
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

```bash
npm run test:run -- tests/AlertBanner.test.jsx
```

Expected: FAIL

- [ ] **Step 3 : Implémenter AlertBanner**

Créer `src/components/AlertBanner.jsx` :

```jsx
export default function AlertBanner({ message }) {
  if (!message) return null
  return (
    <div className="alert-banner" role="alert">
      <span className="alert-banner__icon">⚠️</span>
      <span>{message}</span>
    </div>
  )
}
```

- [ ] **Step 4 : Lancer les tests**

```bash
npm run test:run -- tests/AlertBanner.test.jsx
```

Expected: `2 tests passed`

- [ ] **Step 5 : Commit**

```bash
git add src/components/AlertBanner.jsx tests/AlertBanner.test.jsx
git commit -m "feat: add AlertBanner component"
```

---

### Task 11 : DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.jsx`
- Create: `src/styles/dashboard.css`, `tests/DashboardPage.test.jsx`

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `tests/DashboardPage.test.jsx` :

```jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DashboardPage from '../src/pages/DashboardPage'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
    user: { uid: 'uid-yves' },
  }),
}))

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('DashboardPage', () => {
  it('displays greeting with user name', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText(/Bonjour Yves/)).toBeInTheDocument()
  })

  it('renders all 8 module cards', () => {
    wrap(<DashboardPage />)
    expect(screen.getByText('Courses')).toBeInTheDocument()
    expect(screen.getByText('Repas')).toBeInTheDocument()
    expect(screen.getByText('Frigo')).toBeInTheDocument()
    expect(screen.getByText('Ménage')).toBeInTheDocument()
    expect(screen.getByText('Bricolage')).toBeInTheDocument()
    expect(screen.getByText('Dépenses')).toBeInTheDocument()
    expect(screen.getByText('Agenda')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2 : Lancer les tests pour vérifier l'échec**

```bash
npm run test:run -- tests/DashboardPage.test.jsx
```

Expected: FAIL — tests échouent avec le stub vide

- [ ] **Step 3 : Créer dashboard.css**

```css
/* src/styles/dashboard.css */
.dashboard {
  max-width: 480px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.dashboard__date {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dashboard__greeting {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--text-primary);
  line-height: 1.2;
}

.dashboard__avatars {
  display: flex;
}

.dashboard__avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.9rem;
  color: #fff;
  border: 2.5px solid var(--bg-base);
}

.dashboard__avatar + .dashboard__avatar {
  margin-left: -8px;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* ModuleCard styles */
.module-card {
  background: var(--bg-input);
  border-radius: var(--radius-card);
  padding: 1rem;
  border: 1.5px solid var(--border-card);
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.module-card--blue  { border-top: 2px solid var(--color-yves); }
.module-card--green { border-top: 2px solid var(--color-enza); }
.module-card--warn  { border-color: rgba(239, 68, 68, 0.5); background: #1e1020; }

.module-card__badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-yves);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 900;
  color: #fff;
}

.module-card__icon {
  font-size: 1.6rem;
  margin-bottom: 0.45rem;
}

.module-card__name {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.module-card__subtitle {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
}

.module-card__subtitle--blue  { color: var(--color-yves-light); }
.module-card__subtitle--green { color: var(--color-enza-light); }
.module-card__subtitle--warn  { color: var(--color-alert-light); }

/* AlertBanner */
.alert-banner {
  background: linear-gradient(135deg, #1a0f0f, #2a1515);
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: 14px;
  padding: 0.65rem 0.9rem;
  margin-bottom: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fca5a5;
}

.alert-banner__icon { font-size: 1rem; }
```

- [ ] **Step 4 : Implémenter DashboardPage**

Remplacer le contenu de `src/pages/DashboardPage.jsx` :

```jsx
import { useAuth } from '../contexts/AuthContext'
import ModuleCard from '../components/ModuleCard'
import AlertBanner from '../components/AlertBanner'
import '../styles/dashboard.css'

const MODULES = [
  { id: 'courses',   icon: '🛒', nom: 'Courses',   path: '/courses' },
  { id: 'repas',     icon: '🍽️', nom: 'Repas',     path: '/repas' },
  { id: 'frigo',     icon: '🧊', nom: 'Frigo',     path: '/frigo' },
  { id: 'menage',    icon: '🧹', nom: 'Ménage',    path: '/menage' },
  { id: 'bricolage', icon: '🔧', nom: 'Bricolage', path: '/bricolage' },
  { id: 'depenses',  icon: '💰', nom: 'Dépenses',  path: '/depenses' },
  { id: 'agenda',    icon: '📅', nom: 'Agenda',    path: '/agenda' },
  { id: 'notes',     icon: '📝', nom: 'Notes',     path: '/notes' },
]

function formatDate() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const initial = profile?.nom?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__date">{formatDate()}</div>
          <div className="dashboard__greeting">Bonjour {profile?.nom} 👋</div>
        </div>
        <div className="dashboard__avatars">
          <div
            className="dashboard__avatar"
            style={{ background: profile?.couleur ?? '#2563eb' }}
          >
            {initial}
          </div>
        </div>
      </div>

      {/* AlertBanner — alimenté dynamiquement dans Plan 2 */}
      <AlertBanner message={null} />

      <div className="dashboard__grid">
        {MODULES.map(m => (
          <ModuleCard key={m.id} {...m} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5 : Lancer tous les tests**

```bash
npm run test:run
```

Expected: tous les tests passent (AuthContext, LoginPage, ModuleCard, AlertBanner, DashboardPage)

- [ ] **Step 6 : Build final**

```bash
npm run build
```

Expected: `✓ built in Xs` sans erreur.

- [ ] **Step 7 : Créer le stub Service Worker FCM**

Créer `public/firebase-messaging-sw.js` :

```js
// Service Worker Firebase Cloud Messaging
// Implémentation complète dans Plan 5 (Notifications FCM)
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js')
```

- [ ] **Step 8 : Commit final**

```bash
git add src/pages/DashboardPage.jsx src/styles/dashboard.css tests/DashboardPage.test.jsx public/firebase-messaging-sw.js
git commit -m "feat: add DashboardPage with 8 module cards and dashboard layout"
```

- [ ] **Step 9 : Vérifier la branche et push sur GitHub → déploiement automatique**

```bash
# Vérifier que la branche s'appelle bien "master" (doit afficher "master")
git branch --show-current

# Si la branche s'appelle "main", la renommer :
# git branch -m main master

git push origin master
```

Expected: GitHub Actions se déclenche, build + deploy sur Firebase Hosting.
Vérifier dans l'onglet Actions de GitHub que le workflow passe au vert.

---

## Résumé du Plan 1

À la fin de ce plan, tu as :
- ✅ App React déployée sur `home-manager-xxx.web.app`
- ✅ Yves peut créer un compte, obtenir un code foyer, le partager à Enza
- ✅ Enza peut créer son compte en entrant le code foyer
- ✅ Les deux voient le dashboard avec les 8 cartes de modules
- ✅ Tests unitaires pour tous les composants
- ✅ CI/CD : chaque push sur `master` déploie automatiquement

**Prochain plan :** Plan 2 — Liste de courses + Inventaire frigo (avec sync temps réel)
