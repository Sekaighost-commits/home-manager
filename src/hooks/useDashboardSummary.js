import { useCourses } from './useCourses'
import { useFrigo } from './useFrigo'
import { useRepas } from './useRepas'
import { useMenage } from './useMenage'
import { useDepenses } from './useDepenses'

export function useDashboardSummary(foyerId) {
  const { articles } = useCourses(foyerId)
  const { produits, expirants } = useFrigo(foyerId)
  const { idees } = useRepas(foyerId)
  const { taches } = useMenage(foyerId)
  const { depenses } = useDepenses(foyerId)

  const uncheckedCount = articles.filter(a => !a.fait).length
  const coursesSummary = {
    subtitle: uncheckedCount > 0 ? `${uncheckedCount} à acheter` : 'Liste vide',
    badge: null,
  }

  const frigoCount = expirants.length
  const frigoSummary = {
    subtitle: frigoCount > 0 ? `${frigoCount} expirent bientôt` : `${produits.length} produit${produits.length !== 1 ? 's' : ''}`,
    badge: frigoCount > 0 ? frigoCount : null,
    alertMessage: frigoCount > 0 ? `${frigoCount} produit${frigoCount > 1 ? 's expirent' : ' expire'} dans 3 jours ou moins` : null,
  }

  const repasCount = idees.length
  const repasSummary = {
    subtitle: repasCount > 0 ? `${repasCount} idée(s)` : 'Aucune idée',
    badge: null,
  }

  const pendingCount = taches.filter(t => !t.fait).length
  const menageSummary = {
    subtitle: pendingCount > 0 ? `${pendingCount} à faire` : 'Tout est propre ✨',
    badge: pendingCount > 0 ? pendingCount : null,
  }

  const totalDepenses = depenses.reduce((s, d) => s + (d.montant ?? 0), 0)
  const depensesSummary = {
    subtitle: depenses.length > 0 ? `${totalDepenses.toFixed(2)} €` : 'Aucune dépense',
    badge: null,
  }

  return { courses: coursesSummary, frigo: frigoSummary, repas: repasSummary, menage: menageSummary, depenses: depensesSummary }
}
