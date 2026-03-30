# Home Manager — Design Specification
**Date :** 2026-03-30
**Statut :** Approuvé
**Utilisateurs :** Yves (bleu #2563eb) & Enza (vert #16a34a)

---

## 1. Vue d'ensemble

Application web personnelle de gestion du foyer pour deux personnes. Accessible depuis un navigateur mobile, synchronisée en temps réel entre les deux utilisateurs. Chaque module adresse un besoin concret du quotidien : courses oubliées, repas à planifier, dates de péremption, ménage, bricolage, dépenses, agenda et notes.

---

## 2. Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Frontend | React (Vite) | Interface mobile-first, composants modulaires |
| Base de données | Firebase Firestore | Données temps réel, sync instantanée |
| Authentification | Firebase Auth | Comptes séparés email/password |
| Notifications push | FCM + GitHub Actions cron | Rappels agenda (voir Section 7) |
| Hébergement | Firebase Hosting | URL publique, déploiement depuis GitHub |
| Code source | GitHub | Versioning, déploiement automatique |
| Police | Nunito (Google Fonts) | Interface ronde et lisible sur mobile |

**Gratuit :** Firebase Spark plan — largement suffisant pour 2 utilisateurs. Cloud Functions non disponible sur Spark — les notifications planifiées sont déclenchées via GitHub Actions (voir Section 7).
**Déploiement :** push GitHub → Firebase Hosting (CI/CD automatique via GitHub Actions).

---

## 3. Identité visuelle

- **Thème :** Dark mode exclusif (`#0d0d1a` fond, `#12121f` cartes)
- **Police :** Nunito — poids 400/600/700/800/900
- **Couleur Yves :** `#2563eb` (bleu) / accent `#60a5fa`
- **Couleur Enza :** `#16a34a` (vert nature) / accent `#4ade80`
- **Principe :** la couleur de l'utilisateur apparaît sur tout ce qu'il crée (articles, tâches, dépenses, événements)
- **Bordures cartes :** `#1e1e3a`, border-radius `18px`
- **Alertes :** rouge `#ef4444` pour urgences (péremptions, solde dû)

---

## 4. Architecture utilisateurs

```
Firebase Auth
├── Compte Yves   { uid, email, nom: "Yves",  couleur: "#2563eb", foyerId }
└── Compte Enza   { uid, email, nom: "Enza",  couleur: "#16a34a", foyerId }

foyers/{foyerId}
  membres : [uid_yves, uid_enza]
  createdAt : timestamp
```

- Connexion par email + mot de passe
- Un seul foyer partagé (`foyerId` commun stocké dans les profils Firestore)
- Toutes les données du foyer incluent `foyerId` — les règles de sécurité Firestore vérifient que l'utilisateur connecté est membre du foyer avant toute lecture/écriture
- Les actions de chaque utilisateur sont tracées par son `uid`

**Règle de sécurité Firestore (principe) :**
```
allow read, write: if request.auth != null
  && request.auth.uid in get(/foyers/$(resource.foyerId)).data.membres;
```

---

## 5. Navigation

**Écran d'accueil :** Dashboard avec grille 2×4 de cartes de modules.
Chaque carte affiche :
- Icône + nom du module
- Résumé dynamique ("5 articles", "2 périmés bientôt")
- Badge de notification si action requise
- Barre colorée en haut si le module a une activité récente

**Accès à un module :** tap sur la carte → écran dédié du module.
**Retour :** bouton retour en haut à gauche → dashboard.

---

## 6. Modules

> **Note :** tous les documents Firestore incluent `foyerId: string` pour l'application des règles de sécurité.

### 6.1 🛒 Liste de courses *(priorité 1)*

**Fonctionnalités :**
- Ajouter / supprimer des articles
- Cocher un article en magasin (barré + semi-transparent)
- Catégories : Frais, Surgelés, Épicerie, Hygiène, Boissons, Autre
- Chaque article affiche l'avatar coloré de qui l'a ajouté
- Sync temps réel : ajout d'Enza visible instantanément chez Yves
- Vider la liste (supprimer les articles cochés)
- Historique des articles fréquents (suggestions à la saisie)

**Firestore :**
```
courses/articles/{id}
  foyerId    : string
  nom        : string
  categorie  : string
  fait       : boolean
  faitPar    : uid | null
  ajoutePar  : uid
  createdAt  : timestamp
```

---

### 6.2 🍽️ Meal planning

**Fonctionnalités :**
- Vue semaine (7 jours, repas du soir par défaut)
- Assigner un repas à un jour (saisie libre ou depuis recettes sauvegardées)
- Générer les ingrédients manquants dans la liste de courses (déclenchement manuel par bouton) : pour la recette du jour, chaque ingrédient est comparé à l'inventaire frigo ; ceux absents de l'inventaire sont ajoutés à la liste de courses avec `ajoutePar = uid` de l'utilisateur qui déclenche l'action
- Suggestion "qu'est-ce qu'on mange ?" (tirage aléatoire depuis les recettes sauvegardées)
- Bibliothèque de recettes (nom + ingrédients)

**Firestore :**
```
repas/semaine/{semaineId}   ← semaineId = "YYYY-WXX" (ex: "2026-W14")
  foyerId   : string
  lundi     : { repas: string, updatedBy: uid } | null
  mardi     : { repas: string, updatedBy: uid } | null
  mercredi  : { repas: string, updatedBy: uid } | null
  jeudi     : { repas: string, updatedBy: uid } | null
  vendredi  : { repas: string, updatedBy: uid } | null
  samedi    : { repas: string, updatedBy: uid } | null
  dimanche  : { repas: string, updatedBy: uid } | null

repas/recettes/{id}
  foyerId     : string
  nom         : string
  ingredients : [{ nom: string, quantite: string, unite: string }]
  createdBy   : uid
  createdAt   : timestamp
```

---

### 6.3 🧊 Inventaire frigo / garde-manger

**Fonctionnalités :**
- Ajouter un produit avec quantité et date de péremption
- Alerte dashboard si un produit expire dans ≤ 3 jours (calculé côté client au chargement)
- Marquer un produit comme consommé (suppression)
- Filtrer par : Frigo / Congélateur / Garde-manger
- Badge rouge sur la carte dashboard si alertes actives

**Firestore :**
```
frigo/produits/{id}
  foyerId        : string
  nom            : string
  quantite       : string
  emplacement    : "frigo" | "congelateur" | "garde-manger"
  dateExpiration : string (YYYY-MM-DD) | null
  ajoutePar      : uid
  createdAt      : timestamp
```

---

### 6.4 🧹 Planning ménage

**Fonctionnalités :**
- Créer des tâches récurrentes (quotidien / hebdo / mensuel)
- Assigner à Yves, Enza, ou non assigné
- Marquer comme "fait" → avatar de qui l'a fait + date
- Vue semaine en cours
- Historique des tâches accomplies

**Logique de réinitialisation des tâches récurrentes :**
Au chargement du module, le client compare `dateFait` à la période courante :
- `"daily"` : si `dateFait` < aujourd'hui → `fait` remis à `false`
- `"weekly"` : si `dateFait` < lundi de la semaine en cours → remis à `false`
- `"monthly"` : si `dateFait` < 1er du mois en cours → remis à `false`
La remise à zéro est effectuée par une écriture Firestore déclenchée côté client au chargement.

**Firestore :**
```
menage/taches/{id}
  foyerId     : string
  titre       : string
  recurrence  : "daily" | "weekly" | "monthly"
  assigneA    : uid | null
  fait        : boolean
  faitPar     : uid | null
  dateFait    : timestamp | null
  createdBy   : uid
  createdAt   : timestamp
```

---

### 6.5 🔧 Suivi bricolage / réparations

**Fonctionnalités :**
- Créer un travail avec titre, notes, priorité
- Statuts : À faire / En cours / Terminé
- Priorité : Urgente / Normale / Basse
- Filtre par statut

**Firestore :**
```
bricolage/travaux/{id}
  foyerId    : string
  titre      : string
  notes      : string
  statut     : "todo" | "inprogress" | "done"
  priorite   : "urgent" | "normal" | "low"
  createdBy  : uid
  createdAt  : timestamp
```

---

### 6.6 💰 Dépenses du foyer

**Fonctionnalités :**
- Enregistrer une dépense (montant, description, catégorie, qui a payé)
- Catégories : Courses / Loyer / Factures / Restauration / Loisirs / Autre
- Calcul automatique du solde : "Enza te doit X€" ou "Tu dois X€ à Enza" (calculé côté client en sommant les dépenses depuis le dernier `settlement`)
- **Logique de calcul du solde :** le client trouve la dernière transaction `type = "settlement"`, puis somme toutes les dépenses postérieures à cette date. Les transactions `settlement` elles-mêmes sont exclues du calcul.
- Historique mensuel filtrable
- Bouton "Solder" : ajoute une transaction de type `settlement` avec `montant = solde actuel` et `payePar = uid du débiteur`, ce qui remet le calcul à zéro sans supprimer l'historique

**Firestore :**
```
depenses/liste/{id}
  foyerId     : string
  montant     : number
  description : string
  categorie   : string
  payePar     : uid
  type        : "expense" | "settlement"
  date        : timestamp
  createdAt   : timestamp
```

---

### 6.7 📅 Agenda partagé

**Fonctionnalités :**
- Vue mensuelle avec points colorés par utilisateur sur chaque date
- Vue liste des événements du mois
- Événements de Yves (bleu), Enza (vert), communs (dégradé bleu→vert)
- Créer un événement avec : titre, date, heure, type, couleur, note, participants, rappel, récurrence, rappel anticipé
- **Types :** Travail 💼, Médical 🏥, Loisirs 🎉, Maison 🏠, Autre ❓
- **Couleur personnalisée** par événement (palette 8 couleurs)
- **Note :** champ texte toujours présent sur chaque événement
- **Rappel push** (FCM via GitHub Actions) : 15 min / 30 min / 1h / 1 jour avant
- **Récurrence :** Aucune / Hebdo / Mensuel / Annuel
- **Rappel anticipé** (événements récurrents) : jour même / 1 semaine / 2 semaines / 1 mois avant
- Vue dédiée "Événements récurrents"

**Stratégie récurrence :** un seul document par événement récurrent. Le client calcule les occurrences à afficher en fonction de `recurrence` et de la date de base. Aucune duplication en base. **Fenêtre d'affichage :** le client projette les occurrences sur les 3 prochains mois à partir d'aujourd'hui.

**Firestore :**
```
agenda/evenements/{id}
  foyerId      : string
  titre        : string
  date         : string (YYYY-MM-DD) ← date de base / première occurrence
  heure        : string | null
  type         : "travail" | "medical" | "loisirs" | "maison" | "autre"
  couleur      : string (hex)
  note         : string
  participants : uid[]
  rappel       : "15min" | "30min" | "1h" | "1j" | null
  recurrence   : "weekly" | "monthly" | "yearly" | null
  rappelAvance : "1day" | "1week" | "2weeks" | "1month" | null
  createdBy    : uid
  createdAt    : timestamp
```

---

### 6.8 📝 Notes partagées

**Fonctionnalités :**
- Créer / modifier / supprimer des notes (post-its numériques)
- Visible par les deux utilisateurs
- Auteur affiché avec sa couleur
- Tri par date de modification

**Firestore :**
```
notes/liste/{id}
  foyerId    : string
  contenu    : string
  creePar    : uid
  modifiePar : uid | null
  createdAt  : timestamp
  updatedAt  : timestamp
```

---

## 7. Notifications push (FCM + GitHub Actions)

**Contrainte :** Firebase Spark (gratuit) n'inclut pas Cloud Functions. Les notifications planifiées sont déclenchées par un **workflow GitHub Actions cron** (gratuit, 2000 min/mois).

**Architecture :**
```
GitHub Actions (cron toutes les 15 min)
    ↓ script Node.js
Firebase Admin SDK → lit Firestore (événements à notifier)
    ↓
FCM HTTP API → envoie push au(x) device(s) concerné(s)
```

**Fonctionnement :**
1. Service Worker enregistré au premier lancement → demande permission notifications
2. Token FCM du device stocké dans `utilisateurs/{uid}/fcmTokens[]`
3. Workflow GitHub Actions s'exécute toutes les 15 minutes
4. Script lit les événements dont `(date+heure - rappel)` est dans la fenêtre des 15 prochaines minutes
5. Script lit les produits frigo expirant dans ≤ 3 jours (vérification 1x/jour à 8h)
6. FCM envoie la notification aux tokens des `participants` concernés

**Payload notification agenda :**
```json
{ "title": "Home Manager", "body": "Dans 30 min : Ciné — Dune 3 🎬 (20h00)" }
```

**Payload notification frigo :**
```json
{ "title": "🧊 Frigo", "body": "Yaourts expire dans 2 jours" }
```

---

## 8. Déploiement

```
GitHub repo (home-manager)
    ├── GitHub Actions — build + deploy → Firebase Hosting
    └── GitHub Actions cron (*/15 * * * *) → script notifications FCM
```

- `main` branch = production
- Build React → fichiers statiques → déployés sur Firebase Hosting
- URL : `home-manager-[id].web.app`
- **Règles de sécurité Firestore :** chaque collection vérifie que `request.auth.uid` est membre du foyer (`foyerId` présent sur chaque document)
- **Variables d'environnement GitHub Secrets :** `FIREBASE_SERVICE_ACCOUNT` (pour le script cron), `FIREBASE_TOKEN` (pour le déploiement)

---

## 9. Ordre de développement

1. **Setup** — Projet React (Vite) + Firebase + GitHub + déploiement initial vide
2. **Auth** — Connexion / inscription, création foyer, profils Yves & Enza avec couleurs
3. **Dashboard** — Grille 8 modules avec badges dynamiques (stubs pour les modules non encore développés)
4. **Liste de courses** — Module prioritaire, validation de la sync temps réel
5. **Frigo / garde-manger** — Dates de péremption + alertes dashboard (calcul client)
6. **Meal planning** — Repas semaine + recettes + génération liste de courses
7. **Planning ménage** — Tâches récurrentes + logique de réinitialisation client
8. **Bricolage** — Suivi travaux
9. **Dépenses** — Calcul solde + action Solder
10. **Notes** — Module le plus simple
11. **Agenda** — Module le plus riche (vue calendrier, récurrence, formulaire complet)
12. **Notifications FCM** — Service Worker + GitHub Actions cron + tests push
