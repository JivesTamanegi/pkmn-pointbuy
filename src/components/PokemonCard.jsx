import React from 'react';
import { Trash2, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const PokemonCard = ({ member, index, isSelected, onClick, onRemove }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-200 p-4 rounded-lg border-2",
        isSelected 
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 shadow-sm"
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
        )}>
          <User size={24} />
        </div>
        <div className="text-center overflow-hidden w-full">
          <p className={cn(
            "text-sm font-bold truncate",
            (member.nickname || member.name) ? "text-slate-900" : "text-slate-400 italic"
          )}>
            {member.nickname || member.name || `Pokemon ${index + 1}`}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {member.item || 'No Item'}
          </p>
        </div>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 p-1 text-slate-300 hover:text-red-500 transition-colors"
      >
        <Trash2 size={14} />
      </button>
      
      <div className="absolute top-1 left-1 bg-slate-100 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
        #{index + 1}
      </div>
    </div>
  );
};

export default PokemonCard;
