import React from 'react';
import { Calendar, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TimelineView = ({ memories, onSelect, onLike }) => {
  const { currentUser } = useAuth();

  const grouped = memories.reduce((acc, memory) => {
    const d = new Date(memory.date + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.toLocaleDateString('es-ES', { month: 'long' });
    const key = `${month} ${year}`;

    if (!acc[key]) {
      acc[key] = {
        title: key.charAt(0).toUpperCase() + key.slice(1),
        year,
        items: []
      };
    }
    acc[key].items.push(memory);
    return acc;
  }, {});

  if (memories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 font-medium">No se encontraron recuerdos con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto py-8 px-4">
      {/* Central continuous glowing line */}
      <div className="absolute left-6 md:left-1/2 top-6 bottom-6 w-0.5 bg-gradient-to-b from-rose-400 via-pink-400 to-indigo-400 -translate-x-1/2 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.3)]" />

      {Object.entries(grouped).map(([monthYear, group]) => (
        <div key={monthYear} className="mb-14">
          
          {/* Month/Year Milestone Badge */}
          <div className="flex items-center justify-start md:justify-center mb-8 relative z-10">
            <div className="flex items-center gap-2 px-5 py-2 rounded-full glass-card border border-rose-200/80 text-rose-700 font-black text-xs sm:text-sm tracking-wide shadow-md font-heading">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{group.title}</span>
            </div>
          </div>

          {/* Memories in this month */}
          <div className="space-y-8">
            {group.items.map((mem, idx) => {
              const isEven = idx % 2 === 0;
              const hasLiked = currentUser && mem.likes?.includes(currentUser.email);

              return (
                <div 
                  key={mem.id}
                  className={`relative flex items-center md:justify-between ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot on the timeline */}
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-gradient-to-tr from-rose-500 to-pink-500 border-3 border-white rounded-full -translate-x-1/2 shadow-md z-10 ring-4 ring-rose-100" />

                  {/* Content card */}
                  <div className="ml-14 md:ml-0 md:w-[46%]">
                    <div 
                      onClick={() => onSelect(mem)}
                      className="glass-card p-4 rounded-[22px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(244,63,94,0.15)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                    >
                      <div className="relative aspect-16/10 rounded-2xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={mem.imageUrl}
                          alt={mem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/50 text-white backdrop-blur-xs border border-white/20">
                          {mem.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-rose-500" />
                          {mem.date}
                        </span>
                        <span className="font-bold text-slate-700 text-[11px]">
                          {mem.author?.name}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-600 transition-colors font-heading">
                        {mem.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {mem.description}
                      </p>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1 font-bold text-rose-500">
                          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
                          <span>{mem.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 font-semibold">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{mem.comments?.length || 0}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      ))}
    </div>
  );
};

