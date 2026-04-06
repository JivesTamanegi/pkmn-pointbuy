import React, { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useTeamStore } from '../store/useTeamStore';

const SettingsModal = ({ isOpen, onClose }) => {
  const { team, tierPoints, setPointLimit, setTierPoints } = useTeamStore();
  
  const [localLimit, setLocalLimit] = useState(team.pointLimit);
  const [localTiers, setLocalTiers] = useState({ ...tierPoints });

  if (!isOpen) return null;

  const handleSave = () => {
    setPointLimit(localLimit);
    setTierPoints(localTiers);
    onClose();
  };

  const handleReset = () => {
    setLocalTiers({
        "Uber": 15,
        "OU": 12,
        "UUBL": 10,
        "UU": 8,
        "RUBL": 7,
        "RU": 6,
        "NUBL": 5,
        "NU": 4,
        "PUBL": 3,
        "PU": 2,
        "ZU": 1,
        "NFE": 0,
        "LC": 0,
        "AG": 20,
        "Untiered": 0
    });
    setLocalLimit(100);
  };

  const updateTier = (tier, value) => {
    setLocalTiers(prev => ({ ...prev, [tier]: parseInt(value) || 0 }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Settings
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Point Limit Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Point Limit</h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max="999"
                value={localLimit}
                onChange={(e) => setLocalLimit(parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
              />
              <span className="text-slate-500 text-sm">Total points allowed for the 6 member team.</span>
            </div>
          </section>

          {/* Tier Points Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tier Costs</h3>
              <button 
                onClick={handleReset}
                className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors uppercase font-bold"
              >
                <RotateCcw size={10} /> Reset to Default
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(localTiers)
                .sort((a, b) => b[1] - a[1]) // Sort by cost descending
                .map(([tier, cost]) => (
                <div key={tier} className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 truncate" title={tier}>
                    {tier}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={cost}
                    onChange={(e) => updateTier(tier, e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 rounded-b-lg">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-sm"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
