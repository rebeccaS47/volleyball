import React from 'react';
import { Court } from '../types';

interface CourtSelectorProps {
  filteredCourts: Court[];
  selectedCourt: number | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const CourtSelector: React.FC<CourtSelectorProps> = ({ filteredCourts, selectedCourt, onChange }) => (
  <select
    id="court"
    name="court"
    value={selectedCourt === undefined ? '-1' : selectedCourt}
    onChange={onChange}
  >
    <option value="-1">選擇場地</option>
    {filteredCourts.map((court, index) => (
      <option key={court.id} value={index}>
        {court.name}
      </option>
    ))}
  </select>
);