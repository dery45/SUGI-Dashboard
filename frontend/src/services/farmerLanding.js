import { API_BASE_URL } from './authService';

// Stage priority order for Petani's post-login landing.
export const STAGE_PRIORITY = [
  { stage: 'Land_Preparation', path: '/management/lifecycle/persiapan-lahan' },
  { stage: 'Planting', path: '/management/lifecycle/penanaman' },
  { stage: 'Maintenance', path: '/management/lifecycle/perawatan' },
  { stage: 'Harvesting', path: '/management/lifecycle/panen' },
];

// Fallback when the farmer has zero accessible stages: Persiapan Lahan renders
// the backend guard's Indonesian no-access message inline (no redirect loop).
export const FARMER_FALLBACK_PATH = '/management/lifecycle/persiapan-lahan';

/**
 * Resolve a Petani's landing path from their ACTIVE assignments.
 * Empty access_stages on any assignment = full access → first priority stage.
 * Otherwise: first stage in STAGE_PRIORITY present across assignments.
 * Network/validation failures fall back to FARMER_FALLBACK_PATH.
 */
export async function resolveFarmerLanding(token) {
  if (!token) return FARMER_FALLBACK_PATH;
  try {
    const res = await fetch(`${API_BASE_URL}/assignments/farmer-assignments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.success) return FARMER_FALLBACK_PATH;
    const assignments = json.data || [];
    if (!assignments.length) return FARMER_FALLBACK_PATH;
    const hasFull = assignments.some(a => !a.access_stages || a.access_stages.length === 0);
    if (hasFull) return STAGE_PRIORITY[0].path;
    const granted = new Set(assignments.flatMap(a => a.access_stages || []));
    const first = STAGE_PRIORITY.find(s => granted.has(s.stage));
    return first ? first.path : FARMER_FALLBACK_PATH;
  } catch {
    return FARMER_FALLBACK_PATH;
  }
}
