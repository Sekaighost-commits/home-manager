import { useCourses } from './useCourses'
import { useFrigo } from './useFrigo'
import { useRepas } from './useRepas'
import { useMenage } from './useMenage'
import { useBricolage } from './useBricolage'
import { useNotes } from './useNotes'
import { useDepenses } from './useDepenses'
import { useAgenda } from './useAgenda'

export function useDashboardSummary(foyerId) {
  const { articles } = useCourses(foyerId)
  const { produits, expirants } = useFrigo(foyerId)
  const { idees } = useRepas(foyerId)
  const { taches } = useMenage(foyerId)
  const { travaux } = useBricolage(foyerId)
  const { notes } = useNotes(foyerId)
  const { depenses } = useDepenses(foyerId)
  const { evenements } = useAgenda(foyerId)

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

  const pendingMenageCount = taches.filter(t => !t.fait).length
  const menageSummary = {
    subtitle: pendingMenageCount > 0 ? `${pendingMenageCount} à faire` : 'Tout est propre ✨',
    badge: pendingMenageCount > 0 ? pendingMenageCount : null,
  }

  const activeTravaux = travaux.filter(t => t.statut !== 'done')
  const urgentCount = activeTravaux.filter(t => t.priorite === 'urgent').length
  const bricolageSummary = {
    subtitle: urgentCount > 0
      ? `${urgentCount} urgent(s)`
      : activeTravaux.length > 0
        ? `${activeTravaux.length} en cours`
        : 'Tout est fait',
    badge: urgentCount > 0 ? urgentCount : null,
  }

  const notesSummary = {
    subtitle: notes.length > 0 ? `${notes.length} note(s)` : 'Aucune note',
    badge: null,
  }

  const totalDepenses = depenses.reduce((s, d) => s + (d.montant ?? 0), 0)
  const depensesSummary = {
    subtitle: depenses.length > 0 ? `${totalDepenses.toFixed(2)} €` : 'Aucune dépense',
    badge: null,
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcomingCount = evenements.filter(e => e.date >= today).length
  const agendaSummary = {
    subtitle: upcomingCount > 0 ? `${upcomingCount} à venir` : 'Aucun évènement',
    badge: null,
  }

  return {
    courses: coursesSummary,
    frigo: frigoSummary,
    repas: repasSummary,
    menage: menageSummary,
    bricolage: bricolageSummary,
    notes: notesSummary,
    depenses: depensesSummary,
    agenda: agendaSummary,
  }
}
