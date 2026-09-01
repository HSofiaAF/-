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
    <div className="relative max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Central continuous glowing line */}
      <div className="absolute left-4 sm:left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-rose-500 via-pink-400 to-indigo-500 -translate-x-1/2 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.4)]" />

      {Object.entries(grouped).map(([monthYear, group]) => (
        <div key={monthYear} className="mb-8 sm:mb-14">
          
          {/* Month/Year Milestone Badge */}
          <div className="flex items-center justify-start md:justify-center mb-6 sm:mb-8 relative z-10 pl-8 sm:pl-12 md:pl-0">
            <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full glass-card border border-white/20 text-rose-300 font-black text-xs sm:text-sm tracking-wide shadow-xl font-editorial">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>{group.title}</span>
            </div>
          </div>

          {/* Memories in this month */}
          <div className="space-y-5 sm:space-y-8">
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
                  <div className="absolute left-4 sm:left-6 md:left-1/2 w-4 h-4 bg-rose-500 border-2 border-white rounded-full -translate-x-1/2 shadow-[0_0_10px_rgba(244,63,94,0.8)] z-10 ring-4 ring-rose-500/20" />

                  {/* Content card */}
                  <div className="ml-9 sm:ml-14 md:ml-0 md:w-[46%] w-full">
                    <div 
                      onClick={() => onSelect(mem)}
                      className="glass-card p-3.5 sm:p-4 rounded-3xl border border-white/15 shadow-xl hover:border-white/30 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.99] cursor-pointer group text-slate-200"
                    >
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3 bg-slate-900">
                        {mem.mediaType === 'video' ? (
                          <video src={mem.imageUrl} muted loop autoPlay playsInline className="w-full h-full object-cover" />
                        ) : <img src={mem.imageUrl} alt={mem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold glass-pill text-white border border-white/20">
                          {mem.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-1 font-medium text-[11px]">
                          <Calendar className="w-3 h-3 text-rose-400" />
                          {mem.date}
                        </span>
                        <span className="font-bold text-slate-300 text-[11px]">
                          {mem.author?.name}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-rose-300 transition-colors font-editorial leading-snug">
                        {mem.title}
                      </h4>
                      {mem.description && (
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {mem.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onLike) onLike(mem.id);
                          }}
                          className="flex items-center gap-1 font-bold text-rose-400 text-[11px] hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400' : ''}`} />
                          <span>{mem.likes?.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
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
