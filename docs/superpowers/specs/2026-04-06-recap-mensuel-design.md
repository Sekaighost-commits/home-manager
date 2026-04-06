# Récap mensuel — Design Spec

**Date :** 2026-04-06
**Projet :** home-manager
**Statut :** Approuvé

---

## Objectif

Permettre aux utilisateurs de consulter un résumé mensuel de leur activité foyer : articles de courses achetés, dépenses par catégorie, et évènements agenda. La page est accessible depuis le dashboard et permet de naviguer entre les mois passés via des pills.

---

## Périmètre

Trois modules tracés :

| Module | Source de données | Mécanisme |
|---|---|---|
| Courses | `coursesArticles` | Archive au lieu de supprimer (`clearDone`) |
| Dépenses | `depenses` | Déjà persistant — query par `createdAt` |
| Agenda | `agenda` | Déjà persistant — query par `date` |

Modules **non tracés** : Repas, Ménage, Bricolage, Frigo, Notes (suppressions individuelles conservées destructives).

---

## Couche données

### Modification de `useCourses`

**`clearDone`** : remplace les `deleteDoc` par des `updateDoc` avec archivage :

```js
await updateDoc(doc(db, 'coursesArticles', a.id), {
  archived: true,
  archivedAt: serverTimestamp(),
})
```

**Query onSnapshot** : ajoute un filtre pour exclure les archivés de la vue normale :

```js
query(
  collection(db, 'coursesArticles'),
  where('foyerId', '==', foyerId),
  where('archived', '!=', true),
  orderBy('createdAt')
)
```

> ⚠️ Index composite Firestore requis : `(foyerId ASC, archived ASC, createdAt ASC)`

### Hook `useRecap(foyerId, annee, mois)`

Fait 3 queries `onSnapshot` en parallèle au montage et se désabonne au démontage.

**Paramètres :** `foyerId: string | null`, `annee: number`, `mois: number` (0-indexé)

**Retour :**

```js
{
  courses: Array<{ id, nom, archivedAt, ... }>,
  depenses: Array<{ id, montant, categorie, createdAt, ... }>,
  agenda: Array<{ id, titre, date, ajoutePar, commun }>,
  loading: boolean,
}
```

**Calculs côté client** (dans `useRecap`) :

- `totalDepenses` : somme des `montant`
- `depensesParCategorie` : `Array<{ categorie, total }>` trié par montant décroissant

**Fenêtre temporelle :**

- Courses : `archivedAt >= début_mois` et `archivedAt < début_mois_suivant`
- Dépenses : `createdAt >= début_mois` et `createdAt < début_mois_suivant`
- Agenda : `date >= 'YYYY-MM-01'` et `date <= 'YYYY-MM-31'` (string ISO)

**Guard :** si `foyerId` est null, retourne immédiatement `{ courses: [], depenses: [], agenda: [], loading: false }`.

**Subscriptions :** 3 `onSnapshot` indépendants, chacun mis à jour de façon autonome. `loading` passe à `false` quand les 3 ont résolu au moins une fois.

---

## Composants & UI

### `RecapPage`

Fichier : `src/pages/RecapPage.jsx`

**Couleur accent :** `#8b5cf6` (violet — différenciée des autres modules)

**Structure :**

```
<div class="module-page" style="--module-accent: #8b5cf6">
  <header class="page-header">
    <button>‹ Retour</button>
    <span>Récap</span>
    <span /> {/* spacer */}
  </header>

  <div class="recap-pills">
    {6 derniers mois comme pills scrollables}
  </div>

  {loading ? <div class="module-page" /> : <>
    <RecapSection title="🛒 Courses" count={courses.length} unit="articles">
      {chips des noms d'articles}
    </RecapSection>

    <RecapSection title="💸 Dépenses" total={totalDepenses}>
      {lignes par catégorie : icône + nom + montant}
    </RecapSection>

    <RecapSection title="📅 Agenda" count={agenda.length} unit="évènements">
      {liste triée par date : "JJ mois — titre"}
    </RecapSection>
  </>}
</div>
```

**Pills :** Les 6 derniers mois générés dynamiquement depuis la date du jour. Mois sélectionné en `--module-accent`, les autres en style neutre. Scroll horizontal sur mobile.

**État vide par section :** Si aucune donnée, affiche `<span class="empty-state__text">Rien à afficher ce mois</span>`.

### Dashboard

Ajouter une `ModuleCard` "Récap" dans `DashboardPage` pointant vers `/recap`, avec la couleur `#8b5cf6`.

### Routing

Ajouter `<Route path="/recap" element={<RecapPage />} />` dans `App.jsx`.

---

## Tests

### `tests/useRecap.test.js` (3 tests)

1. `returns loading:true then data once all 3 snapshots resolve` — vérifie que `loading` est `true` avant résolution, puis `false` avec les données
2. `calculates totalDepenses and depensesParCategorie correctly` — calcul correct du total et groupement par catégorie
3. `returns empty arrays when no data for the month` — guard vide si snapshots vides

### `tests/RecapPage.test.jsx` (7 tests)

1. `renders the page title` — "Récap" présent
2. `renders 6 month pills` — 6 pills affichées
3. `marks current month pill as selected` — pill du mois courant a la classe active
4. `clicking a pill changes the displayed month` — clic sur une pill change le mois
5. `shows courses articles for selected month` — les noms d'articles apparaissent
6. `shows depenses total and category breakdown` — total + lignes catégories
7. `shows agenda events for selected month` — liste des évènements triés

### `tests/useCourses.test.js` (2 tests ajoutés)

1. `clearDone calls updateDoc with archived:true instead of deleteDoc` — vérifie `updateDoc` appelé avec `{ archived: true, archivedAt: serverTimestamp() }`
2. `onSnapshot query filters archived != true` — vérifie le filtre dans la query

---

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `src/hooks/useRecap.js` | Créer |
| `src/pages/RecapPage.jsx` | Créer |
| `src/hooks/useCourses.js` | Modifier (`clearDone` + query) |
| `src/pages/DashboardPage.jsx` | Modifier (nouvelle ModuleCard) |
| `src/App.jsx` | Modifier (nouvelle route) |
| `tests/useRecap.test.js` | Créer |
| `tests/RecapPage.test.jsx` | Créer |
| `tests/useCourses.test.js` | Modifier (2 tests ajoutés) |
| `firestore.rules` | Vérifier (pas de changement attendu) |

---

## Contraintes

- **Spark plan Firestore** : pas de Cloud Functions. Tous les calculs sont côté client.
- **Rétention indéfinie** : pas de TTL sur les docs archivés.
- **2 utilisateurs max** : pas d'optimisation pagination nécessaire.
- **Pas de migration** : l'app n'est pas encore utilisée en production.
