import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  availableTypes: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  availableTypes,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search by name or text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-border rounded-normal px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <div className="w-full md:w-48">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full bg-surface border border-border rounded-normal px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">All Types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
