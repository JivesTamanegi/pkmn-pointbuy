import { create } from 'zustand';

const INITIAL_TEAM_MEMBERS = Array(6).fill(null).map(() => ({
  name: '',
  cost: 0,
  item: '',
  ability: '',
  level: 100,
  teraType: '',
  moves: ['', '', '', ''],
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
  nature: 'Serious'
}));

export const useTeamStore = create((set) => ({
  team: {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    name: 'New Team',
    members: INITIAL_TEAM_MEMBERS,
    pointLimit: 100, // Default point limit
  },
  pointList: {}, // Map of pokemon name -> cost
  tierPoints: {
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
  },
  isBrowserOpen: false,
  selectedMemberIndex: null,
  
  setTeam: (team) => set({ team }),
  setSelectedMemberIndex: (index) => set({ selectedMemberIndex: index, isBrowserOpen: index !== null }),
  setIsBrowserOpen: (isOpen) => set({ isBrowserOpen: isOpen }),
  
  updateMember: (index, memberUpdate) =>
    set((state) => ({
      team: {
        ...state.team,
        members: state.team.members.map((m, i) => i === index ? { ...m, ...memberUpdate } : m)
      }
    })),
    
  setPointList: (pointList) => set((state) => ({ 
    pointList,
    // When point list is updated, re-calculate costs for existing members if their names match
    team: {
      ...state.team,
      members: state.team.members.map(m => ({
        ...m,
        cost: pointList[m.name] || 0
      }))
    }
  })),
  
  setPointLimit: (limit) => set((state) => ({
    team: { ...state.team, pointLimit: limit }
  })),
  
  setTierPoints: (tierPoints) => set({ tierPoints }),
}));
