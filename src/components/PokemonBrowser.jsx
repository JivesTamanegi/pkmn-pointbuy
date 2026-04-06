import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTeamStore } from '../store/useTeamStore';

const PokemonBrowser = () => {
  const { pointList, updateMember, selectedMemberIndex, setIsBrowserOpen } = useTeamStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPokemon = Object.entries(pointList)
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a[0].localeCompare(b[0]));

  const handleSelect = (name, cost) => {
    updateMember(selectedMemberIndex, { name, cost });
    setIsBrowserOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold">Select Pokemon</h2>
          <button 
            onClick={() => setIsBrowserOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="Search Pokemon..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredPokemon.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredPokemon.map(([name, cost]) => (
                <button
                  key={name}
                  onClick={() => handleSelect(name, cost)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <span className="font-medium text-slate-700">{name}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                    Cost: {cost}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              {Object.keys(pointList).length === 0 
                ? "No point list imported. Please import a JSON point list first."
                : "No Pokemon found matching your search."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokemonBrowser;
