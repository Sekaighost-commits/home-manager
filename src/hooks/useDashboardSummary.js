import { useCourses } from './useCourses'
import { useFrigo } from './useFrigo'

export function useDashboardSummary(foyerId) {
  const { articles } = useCourses(foyerId)
  const { produits, expirants } = useFrigo(foyerId)

  const uncheckedCount = articles.filter(a => !a.fait).length

  const coursesSummary = {
    subtitle: uncheckedCount > 0 ? `${uncheckedCount} à acheter` : 'Liste vide',
    badge: null,
  }

  const frigoCount = expirants.length
  const frigoSummary = {
    subtitle: frigoCount > 0
      ? `${frigoCount} expirent bientôt`
      : `${produits.length} produit${produits.length !== 1 ? 's' : ''}`,
    badge: frigoCount > 0 ? frigoCount : null,
    alertMessage: frigoCount > 0
      ? `${frigoCount} produit${frigoCount > 1 ? 's expirent' : ' expire'} dans 3 jours ou moins`
      : null,
  }

  return { courses: coursesSummary, frigo: frigoSummary }
}
