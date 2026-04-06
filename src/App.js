import React, { useState, useEffect } from 'react';
import { useTeamStore } from './store/useTeamStore';
import TeamMember from './components/TeamMember';
import PokemonBrowser from './components/PokemonBrowser';
import SettingsModal from './components/SettingsModal';
import { Globe, Loader2, Settings } from 'lucide-react';
import axios from 'axios';
import * as SmogonFrontend from './services/smogonService';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? null // In production, we'll default to frontend scraping
  : 'http://localhost:5001/api';

function App() {
  const { 
    team, 
    setPointList,
    setSelectedMemberIndex,
    isBrowserOpen,
    tierPoints
  } = useTeamStore();

  const [isScraping, setIsScraping] = useState(false);
  const [formats, setFormats] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selectedGen, setSelectedGen] = useState('sv');
  const [selectedTier, setSelectedTier] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        if (API_BASE_URL) {
          const response = await axios.get(`${API_BASE_URL}/formats`);
          if (response.data && response.data.success) {
            setFormats(response.data.formats);
            return;
          }
        }
        
        // Fallback or Production: use frontend scraper
        const data = await SmogonFrontend.getSmogonFormats();
        setFormats(data);
      } catch (err) {
        console.error('Error fetching formats:', err);
        // Ensure we at least have some formats
        if (formats.length === 0) {
          setFormats([{ name: 'Scarlet/Violet', shorthand: 'sv' }]);
        }
      }
    };
    fetchFormats();
  }, []);

  useEffect(() => {
    const fetchTiers = async () => {
      if (!selectedGen) return;
      try {
        if (API_BASE_URL) {
          const response = await axios.get(`${API_BASE_URL}/tiers/${selectedGen}`);
          if (response.data && response.data.success) {
            setTiers(response.data.tiers);
            setSelectedTier('');
            return;
          }
        }

        // Fallback or Production: use frontend scraper
        const data = await SmogonFrontend.getTiersForGen(selectedGen);
        setTiers(data);
        setSelectedTier('');
      } catch (err) {
        console.error('Error fetching tiers:', err);
      }
    };
    fetchTiers();
  }, [selectedGen]);

  const totalPoints = team.members.reduce((sum, m) => sum + (m.cost || 0), 0);

  const handleScrapeTiers = async () => {
    setIsScraping(true);
    try {
      let pointsMap;

      if (API_BASE_URL) {
        try {
          const response = await axios.post(`${API_BASE_URL}/scrape-tiers`, { 
            gen: selectedGen,
            tier: selectedTier,
            tierPoints: tierPoints
          });
          if (response.data && response.data.success && response.data.pointList) {
            pointsMap = response.data.pointList;
          }
        } catch (backendErr) {
          console.warn('Backend scraping failed, falling back to frontend:', backendErr.message);
        }
      }

      // If backend failed or we are in production
      if (!pointsMap) {
        pointsMap = await SmogonFrontend.scrapeSmogonTiers(selectedGen, selectedTier, tierPoints);
      }

      if (pointsMap) {
        setPointList(pointsMap);
        const genName = formats.find(f => f.shorthand === selectedGen)?.name || selectedGen;
        const tierName = selectedTier || 'All Tiers';
        alert(`Successfully updated ${Object.keys(pointsMap).length} Pokemon from Smogon ${genName} (${tierName})!`);
      } else {
        throw new Error('Could not retrieve point list');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching Smogon tiers: ' + err.message);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-blue-600">
                Pokemon Point Buy
              </h1>
              <p className="text-slate-500 text-xs">
                Points: <span className={totalPoints > team.pointLimit ? 'text-red-500 font-bold' : 'font-bold text-slate-900'}>
                  {totalPoints}
                </span> / {team.pointLimit}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:block">
               <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
               <span className="text-xs font-medium">
                 {totalPoints > team.pointLimit ? '⚠️ Over Budget' : '✅ Within Budget'}
               </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 shadow-sm">
              <select 
                value={selectedGen} 
                onChange={(e) => setSelectedGen(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold py-2 focus:ring-0 outline-none cursor-pointer"
                disabled={isScraping}
              >
                {formats.length > 0 ? (
                  formats.map(f => (
                    <option key={f.shorthand} value={f.shorthand}>{f.name}</option>
                  ))
                ) : (
                  <option value="sv">Scarlet/Violet</option>
                )}
              </select>
              
              <div className="h-6 w-px bg-slate-200"></div>
              
              <select 
                value={selectedTier} 
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold py-2 focus:ring-0 outline-none cursor-pointer max-w-[120px]"
                disabled={isScraping || tiers.length === 0}
              >
                <option value="">All Tiers</option>
                {tiers.map(t => (
                  <option key={t.shorthand} value={t.shorthand}>{t.name}</option>
                ))}
              </select>

              <button 
                onClick={handleScrapeTiers}
                disabled={isScraping}
                className="p-1 text-blue-600 hover:bg-slate-50 disabled:opacity-50 transition-colors rounded-md"
                title="Scrape Tiers for Selected Gen & Format"
              >
                {isScraping ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
              </button>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-slate-600"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.members.map((member, index) => (
            <TeamMember
              key={index}
              index={index}
              member={member}
              onClick={setSelectedMemberIndex}
            />
          ))}
        </div>
      </main>

      {isBrowserOpen && <PokemonBrowser />}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
