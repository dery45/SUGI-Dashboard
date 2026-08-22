import { useEffect, useState } from 'react';
import { API_BASE_URL as BASE_URL } from '@/services/authService';

/**
 * Eligible cycles for a stage (Penanaman/Perawatan/Panen dropdowns).
 * Shared here so the per-stage pages + Pelaksana scoping read one source.
 */
export function useEligibleCycles(token, stage) {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!stage) return;
    fetch(`${BASE_URL}/lifecycle/cycles/eligible?stage=${stage}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setCycles(j.data || []); }).catch(() => setCycles([]))
      .finally(() => setLoading(false));
  }, [token, stage]);
  return { cycles, loading };
}

/**
 * Pelaksana options sourced from Penugasan: farmers with an ACTIVE assignment
 * matching the selected cycle's farm AND block. Historical free-text values
 * that no longer match are preserved as an extra "(nilai tersimpan)" option.
 */
export function usePelaksanaOptions(token) {
  const [assignments, setAssignments] = useState([]);
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/assignments/farmer-assignments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { if (j.success) setAssignments(j.data || []); })
      .catch(() => setAssignments([]));
  }, [token]);
  return assignments;
}

export function pelaksanaForCycle(assignments, cycle) {
  if (!cycle) return [];
  const farmId = (cycle.farm_master?._id || cycle.farm_id?._id || cycle.farm_master || cycle.farm_id)?.toString?.();
  const blockId = (cycle.block?._id || cycle.block)?.toString?.();
  const seen = new Set();
  const out = [];
  for (const a of assignments) {
    const aFarm = (a.farm?._id || a.farm)?.toString?.();
    const aBlock = (a.block?._id || a.block)?.toString?.();
    if (!aFarm || aFarm !== String(farmId)) continue;
    if (blockId && aBlock && aBlock !== String(blockId)) continue;
    const name = a.farmer?.name || a.farmer?.email || (typeof a.farmer === 'string' ? a.farmer : '');
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out.sort((x, y) => x.localeCompare(y));
}

export function buildPelaksanaChoices(options, currentValue) {
  const choices = [...options];
  if (currentValue && !choices.includes(currentValue)) {
    choices.unshift(currentValue); // historical manual entry stays selectable
  }
  return choices;
}
