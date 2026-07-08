import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LifecycleTabs from '../components/management/LifecycleTabs';
import Card from '../components/common/Card';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const LifecycleManagementPage = () => {
  const { token, user } = useAuth();
  const [allFarms, setAllFarms] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/master-data/farms`, { headers }).then(r => r.json()),
      fetch(`${BASE_URL}/assignments/farmer-assignments`, { headers }).then(r => r.json()).catch(() => ({ success: false }))
    ]).then(([fj, aj]) => {
      if (fj.success) setAllFarms(fj.data);
      if (aj.success) setAssignments(aj.data);
    }).catch(() => {});
  }, [token]);

  const availableFarms = (() => {
    if (user?.role === 'superadmin' || user?.role === 'government') return allFarms;
    if (!assignments.length) return allFarms;
    const assignedFarmMasterIds = [...new Set(assignments.map(a => {
      if (typeof a.farm === 'object') return a.farm?._id;
      return a.farm;
    }).filter(Boolean))];
    if (!assignedFarmMasterIds.length) return allFarms;
    return allFarms.filter(f => assignedFarmMasterIds.includes(f._id));
  })();

  const farmLocked = availableFarms.length === 1;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Manajemen Siklus Pertanian</h1>
            <p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Kelola seluruh tahapan siklus tanam</p>
          </div>
        </div>
      </div>
      <Card>
        <LifecycleTabs availableFarms={availableFarms} farmLocked={farmLocked} />
      </Card>
    </div>
  );
};

export default LifecycleManagementPage;
