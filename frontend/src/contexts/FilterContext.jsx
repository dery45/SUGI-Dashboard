import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [dateRange, setDateRange] = useState({
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  });

  return (
    <FilterContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </FilterContext.Provider>
  );
};
