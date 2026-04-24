const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/management/LifecycleTabs.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport { useGenericResource } from '../../hooks/useGenericResource';"
);

// 2. Dummy Arrays
content = content.replace(/const initialLandRecords = \[(?:.|\n)*?\];\n+const initialPlantings = \[(?:.|\n)*?\];\n+const initialMaintenances = \[(?:.|\n)*?\];\n+const initialHarvests = \[(?:.|\n)*?\];/, '');

const farmsStr = `const FARMS = [
  { id: '661faecfc11c4c1a2b000111', name: 'Blok A - Sumatra' },
  { id: '661faecfc11c4c1a2b000222', name: 'Blok B - Kalimantan' },
  { id: '661faecfc11c4c1a2b000333', name: 'Blok C - Sulawesi' },
];`;
content = content.replace(/const FARMS = \[\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\{[^\}]+\},\s*\];/, farmsStr);

// 3. LandPrepSection
content = content.replace(
  /const \[records, setRecords\] = useState\(initialLandRecords\);/,
  `const { data: recordsData, loading, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/land');
  const records = Array.isArray(recordsData) ? recordsData : [];
  useEffect(() => { fetchData(); }, [fetchData]);`
);
content = content.replace(
  /const handleAdd = \(e\) => \{(?:.|\n)*?setModal\(null\);\s*\};/,
  `const handleAdd = async (e) => {
    e.preventDefault();
    await createData({ ...form, clearing_cost: +form.clearing_cost, status: 'Open' });
    showToast('Lahan baru berhasil dibuka!');
    setModal(null);
  };`
);
content = content.replace(
  /const handleEdit = \(e\) => \{(?:.|\n)*?setModal\(null\);\s*\};/,
  `const handleEdit = async (e) => {
    e.preventDefault();
    await updateData(editTarget._id, { ...form, clearing_cost: +form.clearing_cost });
    showToast('Data lahan diperbarui!');
    setModal(null);
  };`
);
content = content.replace(
  /const handleClose = \(e\) => \{(?:.|\n)*?setModal\(null\);\s*\};/,
  `const handleClose = async (e) => {
    e.preventDefault();
    await updateData(editTarget._id, { land_closing_date: closingDate, status: 'Closed' });
    showToast('Lahan berhasil ditutup!');
    setModal(null);
  };`
);
content = content.replace(
  /const handleDelete = \(id, name\) => \{(?:.|\n)*?\};/,
  `const handleDelete = async (id, name) => {
    if (window.confirm(\`Hapus record lahan "\${name}"?\`)) {
      await deleteData(id);
      showToast('Record lahan dihapus.');
    }
  };`
);

// 4. PlantingSection
content = content.replace(
  /const \[records, setRecords\] = useState\(initialPlantings\);/,
  `const { data: recordsData, loading, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/plantings');
  const records = Array.isArray(recordsData) ? recordsData : [];
  useEffect(() => { fetchData(); }, [fetchData]);`
);
content = content.replace(
  /const handleSubmit = \(e\) => \{(?:.|\n)*?setModal\(null\);\s*\};/,
  `const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = { ...form, area_ha: +form.area_ha, seedling_count: +form.seedling_count };
    if (editTarget) {
      await updateData(editTarget._id, entry);
      showToast('Data penanaman diperbarui!');
    } else {
      await createData(entry);
      showToast('Aktivitas penanaman baru ditambahkan!');
    }
    setModal(null);
  };`
);
content = content.replace(
  /const handleDelete = \(id\) => \{(?:.|\n)*?\};/g, // replace all instances that match
  `const handleDelete = async (id) => {
    if (window.confirm('Hapus record ini?')) {
      await deleteData(id);
      showToast('Data dihapus.');
    }
  };`
);

// 5. MaintenanceSection
content = content.replace(
  /const \[records, setRecords\] = useState\(initialMaintenances\);/,
  `const { data: recordsData, loading, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/activities');
  const records = Array.isArray(recordsData) ? recordsData : [];
  useEffect(() => { fetchData(); }, [fetchData]);`
);
content = content.replace(
  /const handleStatusChange = \(id, newStatus\) => \{(?:.|\n)*?\};/,
  `const handleStatusChange = async (id, newStatus) => {
    await updateData(id, { status: newStatus });
    showToast(\`Status diubah menjadi \${newStatus.replace(/_/g, ' ')}\`);
  };`
);

// 6. HarvestingSection
content = content.replace(
  /const \[records, setRecords\] = useState\(initialHarvests\);/,
  `const { data: recordsData, loading, fetchData, createData, updateData, deleteData } = useGenericResource('lifecycle/harvests');
  const records = Array.isArray(recordsData) ? recordsData : [];
  useEffect(() => { fetchData(); }, [fetchData]);`
);
content = content.replace(
  /const handleClose = \(e\) => \{(?:.|\n)*?setModal\(null\);\s*\};/,
  `const handleClose = async (e) => {
    e.preventDefault();
    await updateData(editTarget._id, { status: 'Completed', actual_yield_kg: +yieldInput });
    showToast(\`Masa panen ditutup.\`);
    setModal(null);
  };`
);

// 7. General ID replacements in DOM
content = content.replace(/r\.id/g, 'r._id');
content = content.replace(/editTarget\.id/g, 'editTarget._id');
content = content.replace(/key=\{r\._id\}/g, 'key={r._id || Math.random()}');

fs.writeFileSync(filePath, content);
console.log('Successfully refactored LifecycleTabs.jsx');
