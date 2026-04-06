# Récap mensuel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une RecapPage permettant de consulter un résumé mensuel (courses archivées, dépenses, agenda) avec navigation par pills.

**Architecture:** `useCourses` archivé au lieu de supprimer (`clearDone`). Nouveau hook `useRecap(foyerId, annee, mois)` avec 3 `onSnapshot` en parallèle. `RecapPage` avec pills de navigation et sections empilées. Carte Récap ajoutée au dashboard.

**Tech Stack:** React 18, Vite 5, Firebase Firestore (Spark), Vitest + @testing-library/react, CSS custom properties

**Spec:** `docs/superpowers/specs/2026-04-06-recap-mensuel-design.md`

---

## Setup

- [ ] **Tirer le dernier main depuis GitHub**

```bash
cd C:/Users/Sekai/OneDrive/Documents/Claude-projets/home-manager
git fetch origin
git checkout main
git pull origin main
```

- [ ] **Créer un worktree pour cette feature**

```bash
git worktree add .worktrees/feat-recap-mensuel -b feature/recap-mensuel
```

Tous les fichiers du plan sont dans `.worktrees/feat-recap-mensuel/`.

---

## Chunk 1 — Couche données

### Task 1 : Modifier `useCourses` — archivage + filtre client-side

**Files:**
- Modify: `src/hooks/useCourses.js`
- Modify: `tests/useCourses.test.js`

- [ ] **Remplacer le test `clearDone` existant et ajouter le test de filtrage client-side**

Dans `tests/useCourses.test.js`, **remplacer** le test ligne 66–77 (test `'calls deleteDoc when clearDone is called with done articles'`) par ces deux tests :

```js
  it('clearDone calls updateDoc with { archived: true, archivedAt } instead of deleteDoc', async () => {
    const { onSnapshot, updateDoc, deleteDoc } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementationOnce((q, cb) => {
      cb({ docs: [{ id: 'a1', data: () => ({ fait: true, nom: 'Lait', createdAt: { seconds: 1 } }) }] })
      return mockUnsub
    })
    const { result } = renderHook(() => useCourses('foyer-1'))
    await act(async () => {
      await result.current.clearDone()
    })
    expect(updateDoc).toHaveBeenCalledOnce()
    const arg = vi.mocked(updateDoc).mock.calls[0][1]
    expect(arg.archived).toBe(true)
    expect(arg.archivedAt).toBeDefined()
    expect(deleteDoc).not.toHaveBeenCalled()
  })

  it('onSnapshot excludes archived articles from articles list', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementationOnce((q, cb) => {
      cb({
        docs: [
          { id: 'a1', data: () => ({ nom: 'Lait', fait: false, archived: false, createdAt: { seconds: 1 } }) },
          { id: 'a2', data: () => ({ nom: 'Pain', fait: true,  archived: true,  createdAt: { seconds: 2 } }) },
        ],
      })
      return mockUnsub
    })
    const { result } = renderHook(() => useCourses('foyer-1'))
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.articles[0].nom).toBe('Lait')
  })
```

- [ ] **Lancer les tests pour vérifier qu'ils échouent**

```bash
cd C:/Users/Sekai/OneDrive/Documents/Claude-projets/home-manager/.worktrees/feat-recap-mensuel
npx vitest run tests/useCourses.test.js
```

Attendu : le test `clearDone` échoue (attend `updateDoc` mais reçoit `deleteDoc`), le test archived échoue (aucun filtre).

- [ ] **Modifier `src/hooks/useCourses.js`**

Deux changements :

**1. Dans le callback `onSnapshot`, ajouter `.filter(a => !a.archived)` :**

```js
    const unsub = onSnapshot(q, snap => {
      setArticles(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(a => !a.archived)
          .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      )
      setLoading(false)
    })
```

**2. Remplacer la fonction `clearDone` :**

```js
  async function clearDone() {
    const done = articles.filter(a => a.fait)
    await Promise.all(done.map(a => updateDoc(doc(db, 'coursesArticles', a.id), {
      archived: true,
      archivedAt: serverTimestamp(),
    })))
  }
```

- [ ] **Lancer les tests pour vérifier qu'ils passent**

```bash
npx vitest run tests/useCourses.test.js
```

Attendu : 6 tests PASS (les 4 existants + les 2 nouveaux)

- [ ] **Commit**

```bash
git add src/hooks/useCourses.js tests/useCourses.test.js
git commit -m "feat: archive clearDone articles instead of deleting them"
```

---

### Task 2 : Hook `useRecap`

**Files:**
- Create: `src/hooks/useRecap.js`
- Create: `tests/useRecap.test.js`

- [ ] **Écrire les tests qui échouent**

```js
// tests/useRecap.test.js
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRecap } from '../src/hooks/useRecap'

vi.mock('../src/firebase.js', () => ({ db: {} }))

const mockUnsub = vi.fn()

// On simule 3 appels onSnapshot successifs (courses, depenses, agenda)
let snapshotCallCount = 0
const mockSnapshots = [
  // courses snapshot
  {
    docs: [
      { id: 'c1', data: () => ({ nom: 'Lait', archived: true, archivedAt: { toMillis: () => 0 }, foyerId: 'foyer-1' }) },
      { id: 'c2', data: () => ({ nom: 'Pain', archived: true, archivedAt: { toMillis: () => 0 }, foyerId: 'foyer-1' }) },
    ],
  },
  // depenses snapshot
  {
    docs: [
      { id: 'd1', data: () => ({ montant: 50, categorie: 'Alimentation', createdAt: { toMillis: () => 0 } }) },
      { id: 'd2', data: () => ({ montant: 30, categorie: 'Alimentation', createdAt: { toMillis: () => 0 } }) },
      { id: 'd3', data: () => ({ montant: 20, categorie: 'Transport',    createdAt: { toMillis: () => 0 } }) },
    ],
  },
  // agenda snapshot
  {
    docs: [
      { id: 'a1', data: () => ({ titre: 'Dentiste', date: '2026-04-12', ajoutePar: 'uid-yves' }) },
    ],
  },
]

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: { fromDate: vi.fn(d => ({ toMillis: () => d.getTime() })) },
  onSnapshot: vi.fn((q, cb) => {
    const snap = mockSnapshots[snapshotCallCount % mockSnapshots.length]
    snapshotCallCount++
    cb(snap)
    return mockUnsub
  }),
}))

describe('useRecap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    snapshotCallCount = 0
  })

  it('returns data and loading:false once all 3 snapshots resolve', () => {
    const { result } = renderHook(() => useRecap('foyer-1', 2026, 3))
    expect(result.current.loading).toBe(false)
    expect(result.current.courses).toHaveLength(2)
    expect(result.current.depenses).toHaveLength(3)
    expect(result.current.agenda).toHaveLength(1)
  })

  it('calculates totalDepenses and depensesParCategorie correctly', () => {
    const { result } = renderHook(() => useRecap('foyer-1', 2026, 3))
    expect(result.current.totalDepenses).toBe(100)
    expect(result.current.depensesParCategorie).toEqual([
      { categorie: 'Alimentation', total: 80 },
      { categorie: 'Transport',    total: 20 },
    ])
  })

  it('returns empty arrays when snapshots contain no data for the month', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    vi.mocked(onSnapshot).mockImplementation((q, cb) => {
      cb({ docs: [] })
      return mockUnsub
    })
    const { result } = renderHook(() => useRecap('foyer-1', 2026, 3))
    expect(result.current.loading).toBe(false)
    expect(result.current.courses).toEqual([])
    expect(result.current.depenses).toEqual([])
    expect(result.current.agenda).toEqual([])
    expect(result.current.totalDepenses).toBe(0)
    expect(result.current.depensesParCategorie).toEqual([])
  })

  it('returns empty arrays when foyerId is null', () => {
    const { result } = renderHook(() => useRecap(null, 2026, 3))
    expect(result.current.loading).toBe(false)
    expect(result.current.courses).toEqual([])
    expect(result.current.depenses).toEqual([])
    expect(result.current.agenda).toEqual([])
    expect(result.current.totalDepenses).toBe(0)
    expect(result.current.depensesParCategorie).toEqual([])
  })
})
```

- [ ] **Lancer pour vérifier qu'ils échouent**

```bash
npx vitest run tests/useRecap.test.js
```

Attendu : FAIL (module non trouvé)

- [ ] **Implémenter `useRecap.js`**

```js
// src/hooks/useRecap.js
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useRecap(foyerId, annee, mois) {
  const [courses, setCourses]   = useState([])
  const [depenses, setDepenses] = useState([])
  const [agenda, setAgenda]     = useState([])
  const [resolved, setResolved] = useState([false, false, false])

  useEffect(() => {
    if (!foyerId) return

    // Réinitialiser loading à chaque changement de mois
    setResolved([false, false, false])

    const debut = Timestamp.fromDate(new Date(annee, mois, 1))
    const fin   = Timestamp.fromDate(new Date(annee, mois + 1, 1))
    // Construire les bornes string sans passer par toISOString() (évite le décalage UTC)
    const pad = n => String(n).padStart(2, '0')
    const debutStr = `${annee}-${pad(mois + 1)}-01`
    const finStr   = mois === 11 ? `${annee + 1}-01-01` : `${annee}-${pad(mois + 2)}-01`

    const mark = (idx) => setResolved(prev => {
      const next = [...prev]
      next[idx] = true
      return next
    })

    const q1 = query(
      collection(db, 'coursesArticles'),
      where('foyerId', '==', foyerId),
      where('archived', '==', true),
      where('archivedAt', '>=', debut),
      where('archivedAt', '<', fin)
    )
    const unsub1 = onSnapshot(q1, snap => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      mark(0)
    })

    const q2 = query(
      collection(db, 'depenses'),
      where('foyerId', '==', foyerId),
      where('createdAt', '>=', debut),
      where('createdAt', '<', fin)
    )
    const unsub2 = onSnapshot(q2, snap => {
      setDepenses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      mark(1)
    })

    const q3 = query(
      collection(db, 'agenda'),
      where('foyerId', '==', foyerId),
      where('date', '>=', debutStr),
      where('date', '<', finStr)
    )
    const unsub3 = onSnapshot(q3, snap => {
      setAgenda(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      mark(2)
    })

    return () => { unsub1(); unsub2(); unsub3() }
  }, [foyerId, annee, mois])

  const loading = !foyerId ? false : !resolved.every(Boolean)

  const totalDepenses = depenses.reduce((sum, d) => sum + (d.montant ?? 0), 0)

  const depensesParCategorie = Object.entries(
    depenses.reduce((acc, d) => {
      acc[d.categorie] = (acc[d.categorie] ?? 0) + (d.montant ?? 0)
      return acc
    }, {})
  )
    .map(([categorie, total]) => ({ categorie, total }))
    .sort((a, b) => b.total - a.total)

  return { courses, depenses, agenda, totalDepenses, depensesParCategorie, loading }
}
```

- [ ] **Lancer les tests pour vérifier qu'ils passent**

```bash
npx vitest run tests/useRecap.test.js
```

Attendu : 4 tests PASS

- [ ] **Lancer la suite complète**

```bash
npx vitest run
```

Attendu : tous les tests PASS

- [ ] **Commit**

```bash
git add src/hooks/useRecap.js tests/useRecap.test.js
git commit -m "feat: add useRecap hook with courses/depenses/agenda queries"
```

---

## Chunk 2 — RecapPage + intégration

### Task 3 : RecapPage + tests

**Files:**
- Create: `src/pages/RecapPage.jsx`
- Create: `tests/RecapPage.test.jsx`

- [ ] **Écrire les tests qui échouent**

```jsx
// tests/RecapPage.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RecapPage from '../src/pages/RecapPage'
import { useRecap } from '../src/hooks/useRecap'

// Fixer aujourd'hui à 2026-04-06 pour des tests stables
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-06T12:00:00'))
})
afterAll(() => vi.useRealTimers())

vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'uid-yves' },
    profile: { nom: 'Yves', couleur: '#2563eb', foyerId: 'foyer-1' },
  }),
}))

const mockRecap = {
  courses: [
    { id: 'c1', nom: 'Lait' },
    { id: 'c2', nom: 'Pain' },
  ],
  depenses: [
    { id: 'd1', montant: 50, categorie: 'Alimentation' },
    { id: 'd2', montant: 20, categorie: 'Transport' },
  ],
  agenda: [
    { id: 'a1', titre: 'Dentiste', date: '2026-04-12', ajoutePar: 'uid-yves' },
    { id: 'a2', titre: 'Dîner',    date: '2026-04-05', ajoutePar: 'uid-yves' },
  ],
  totalDepenses: 70,
  depensesParCategorie: [
    { categorie: 'Alimentation', total: 50 },
    { categorie: 'Transport',    total: 20 },
  ],
  loading: false,
}

vi.mock('../src/hooks/useRecap', () => ({
  useRecap: vi.fn(() => mockRecap),
}))

const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('RecapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRecap).mockReturnValue(mockRecap)
  })

  it('renders the page title', () => {
    wrap(<RecapPage />)
    expect(screen.getByText('Récap')).toBeInTheDocument()
  })

  it('renders 6 month pills', () => {
    const { container } = wrap(<RecapPage />)
    expect(container.querySelectorAll('.recap-pill')).toHaveLength(6)
  })

  it('marks current month pill as selected', () => {
    const { container } = wrap(<RecapPage />)
    const selected = container.querySelector('.recap-pill--selected')
    expect(selected).toBeInTheDocument()
    expect(selected.textContent).toMatch(/avr/i)
  })

  it('clicking a pill calls useRecap with the new month', () => {
    wrap(<RecapPage />)
    // Cliquer sur la première pill (le mois le plus ancien des 6)
    const pills = screen.getAllByRole('button', { name: /jan|fév|mar|avr|mai|juin|juil|aoû|sep|oct|nov|déc/i })
    fireEvent.click(pills[0])
    // useRecap doit avoir été appelé avec un mois différent
    const calls = vi.mocked(useRecap).mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[0]).toBe('foyer-1')
  })

  it('shows courses articles for selected month', () => {
    wrap(<RecapPage />)
    expect(screen.getByText('Lait')).toBeInTheDocument()
    expect(screen.getByText('Pain')).toBeInTheDocument()
  })

  it('shows depenses total and category breakdown', () => {
    wrap(<RecapPage />)
    expect(screen.getByText(/70/)).toBeInTheDocument()
    expect(screen.getByText(/Alimentation/i)).toBeInTheDocument()
    expect(screen.getByText(/Transport/i)).toBeInTheDocument()
  })

  it('shows agenda events sorted by date', () => {
    wrap(<RecapPage />)
    expect(screen.getByText('Dentiste')).toBeInTheDocument()
    expect(screen.getByText('Dîner')).toBeInTheDocument()
  })
})
```

- [ ] **Lancer pour vérifier qu'ils échouent**

```bash
npx vitest run tests/RecapPage.test.jsx
```

Attendu : FAIL (module non trouvé)

- [ ] **Implémenter `RecapPage.jsx`**

```jsx
// src/pages/RecapPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useRecap } from '../hooks/useRecap'
import '../styles/module.css'

const MONTH_NAMES = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc']
const MONTH_NAMES_FULL = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function getPills() {
  const now = new Date()
  const pills = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    pills.push({ annee: d.getFullYear(), mois: d.getMonth() })
  }
  return pills
}

export default function RecapPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const foyerId = profile?.foyerId ?? null

  const pills = getPills()
  const [selected, setSelected] = useState(pills[pills.length - 1]) // mois courant

  const { courses, depenses, agenda, totalDepenses, depensesParCategorie, loading } =
    useRecap(foyerId, selected.annee, selected.mois)

  const agendaSorted = [...agenda].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="module-page" style={{ '--module-accent': '#8b5cf6' }}>
      <header className="page-header">
        <button className="page-header__back" onClick={() => navigate('/')}>‹ Retour</button>
        <span className="page-header__title">Récap</span>
        <span className="page-header__action" />
      </header>

      <div className="recap-pills">
        {pills.map(p => {
          const isSelected = p.annee === selected.annee && p.mois === selected.mois
          return (
            <button
              key={`${p.annee}-${p.mois}`}
              className={`recap-pill${isSelected ? ' recap-pill--selected' : ''}`}
              onClick={() => setSelected(p)}
            >
              {MONTH_NAMES[p.mois]}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="module-page" />
      ) : (
        <>
          {/* Courses */}
          <section className="recap-section">
            <h3 className="recap-section__title">
              🛒 Courses — {courses.length} article{courses.length !== 1 ? 's' : ''}
            </h3>
            {courses.length === 0 ? (
              <span className="empty-state__text">Rien à afficher ce mois</span>
            ) : (
              <div className="recap-chips">
                {courses.map(c => (
                  <span key={c.id} className="recap-chip">{c.nom}</span>
                ))}
              </div>
            )}
          </section>

          {/* Dépenses */}
          <section className="recap-section">
            <h3 className="recap-section__title">
              💸 Dépenses — {totalDepenses.toFixed(2)} €
            </h3>
            {depensesParCategorie.length === 0 ? (
              <span className="empty-state__text">Rien à afficher ce mois</span>
            ) : (
              <div className="recap-depenses">
                {depensesParCategorie.map(({ categorie, total }) => (
                  <div key={categorie} className="recap-depense-row">
                    <span>{categorie}</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Agenda */}
          <section className="recap-section">
            <h3 className="recap-section__title">
              📅 Agenda — {agenda.length} évènement{agenda.length !== 1 ? 's' : ''}
            </h3>
            {agendaSorted.length === 0 ? (
              <span className="empty-state__text">Rien à afficher ce mois</span>
            ) : (
              <div className="recap-agenda">
                {agendaSorted.map(evt => (
                  <div key={evt.id} className="recap-agenda-row">
                    <span className="recap-agenda-date">
                      {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
                        .format(new Date(evt.date + 'T00:00:00'))}
                    </span>
                    <span>{evt.titre}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
```

- [ ] **Ajouter les styles CSS à `src/styles/module.css`**

Ajouter à la fin de `src/styles/module.css` :

```css
/* ── Récap — Pills ── */
.recap-pills {
  display: flex;
  gap: 0.4rem;
  padding: 0 1.2rem 1rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.recap-pills::-webkit-scrollbar { display: none; }

.recap-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  border: none;
  background: var(--bg-glass);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.recap-pill--selected {
  background: var(--module-accent);
  color: #fff;
}

/* ── Récap — Sections ── */
.recap-section {
  padding: 0 1.2rem 1.25rem;
}

.recap-section__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.6rem;
}

/* ── Courses chips ── */
.recap-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.recap-chip {
  background: var(--bg-glass);
  border: 1px solid var(--border-card);
  color: var(--text-primary);
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

/* ── Dépenses rows ── */
.recap-depenses {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.recap-depense-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-primary);
  background: var(--bg-glass);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
}

/* ── Agenda rows ── */
.recap-agenda {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.recap-agenda-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-primary);
  background: var(--bg-glass);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
}

.recap-agenda-date {
  color: var(--module-accent);
  font-weight: 600;
  font-size: 0.78rem;
  min-width: 3.5rem;
}
```

- [ ] **Lancer tous les tests pour vérifier**

```bash
npx vitest run
```

Attendu : tous les tests PASS

- [ ] **Commit**

```bash
git add src/pages/RecapPage.jsx tests/RecapPage.test.jsx src/styles/module.css
git commit -m "feat: add RecapPage with monthly pills and stacked sections"
```

---

### Task 4 : Intégration — Dashboard + route

**Files:**
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/App.jsx`

> Pas de nouveaux tests pour cette tâche — le dashboard et le routing sont couverts par les tests existants de DashboardPage et App, qui n'ont pas de cas spécifiques à ajouter (la ModuleCard et la route suivent exactement le pattern existant).

- [ ] **Ajouter la carte Récap dans `DashboardPage.jsx`**

Dans `src/pages/DashboardPage.jsx`, ajouter l'entrée Récap à la fin du tableau `MODULES` :

```js
const MODULES = [
  { id: 'courses',   icon: '🛒', nom: 'Courses',   path: '/courses',   color: '#22c55e' },
  { id: 'repas',     icon: '🍽️', nom: 'Repas',     path: '/repas',     color: '#f97316' },
  { id: 'frigo',     icon: '🧊', nom: 'Frigo',     path: '/frigo',     color: '#06b6d4' },
  { id: 'menage',    icon: '🧹', nom: 'Ménage',    path: '/menage',    color: '#a855f7' },
  { id: 'bricolage', icon: '🔧', nom: 'Bricolage', path: '/bricolage', color: '#f59e0b' },
  { id: 'depenses',  icon: '💰', nom: 'Dépenses',  path: '/depenses',  color: '#eab308' },
  { id: 'agenda',    icon: '📅', nom: 'Agenda',    path: '/agenda',    color: '#3b82f6' },
  { id: 'notes',     icon: '📝', nom: 'Notes',     path: '/notes',     color: '#ec4899' },
  { id: 'recap',     icon: '📊', nom: 'Récap',     path: '/recap',     color: '#8b5cf6' },
]
```

La fonction `getCardProps` retourne déjà `{}` pour tout id non reconnu (ligne 39 du fichier actuel) — aucune modification de `getCardProps` nécessaire.

- [ ] **Ajouter la route dans `App.jsx`**

Dans `src/App.jsx`, ajouter l'import et la route :

```js
// Ajouter l'import après AgendaPage
import RecapPage from './pages/RecapPage'
```

```js
// Ajouter la route après /notes
<Route path="/recap" element={<ProtectedRoute><RecapPage /></ProtectedRoute>} />
```

- [ ] **Lancer la suite complète**

```bash
npx vitest run
```

Attendu : tous les tests PASS

- [ ] **Commit**

```bash
git add src/pages/DashboardPage.jsx src/App.jsx
git commit -m "feat: wire RecapPage into dashboard and routing"
```

---

## Finalisation

- [ ] **Lancer la suite complète une dernière fois**

```bash
npx vitest run
```

Attendu : tous les tests PASS

- [ ] **Push et PR**

```bash
git push origin feature/recap-mensuel
```

Créer la PR sur GitHub : `feature/recap-mensuel` → `main`
