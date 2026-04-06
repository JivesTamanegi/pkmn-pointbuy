import React from 'react';
import { Trash2, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const TeamMember = ({ member, index, onClick }) => {
  return (
    <button 
      onClick={() => onClick(index)}
      className="bg-white border-2 border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-all p-6 flex flex-col items-center justify-center min-h-[160px] relative group"
    >
      <div className="absolute top-2 left-3 font-bold text-slate-400 text-sm">
        #{index + 1}
      </div>
      
      <div className="absolute top-2 right-3">
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
          member.name ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
        )}>
          Cost: {member.cost || 0}
        </span>
      </div>

      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors",
        member.name ? "bg-blue-50 text-blue-500" : "bg-slate-50 text-slate-300"
      )}>
        <User size={32} />
      </div>

      <div className="text-center">
        <p className={cn(
          "font-bold text-lg",
          member.name ? "text-slate-800" : "text-slate-400 italic"
        )}>
          {member.name || 'Select Pokemon'}
        </p>
      </div>
    </button>
  );
};

export default TeamMember;
