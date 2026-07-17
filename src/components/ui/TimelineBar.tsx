import React from 'react';

interface TimelineEvent {
  event: string;
  date: Date | string;
}

export function TimelineBar({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-0 mt-4">
      {events.map((item, i) => (
        <div key={i} className="flex gap-4 relative pb-6 group">
          {i !== events.length - 1 && (
            <div className="absolute left-[5px] top-6 bottom-0 w-[1px] bg-hairline -z-10 group-hover:bg-program-accent transition-colors" />
          )}
          <div className="w-3 h-3 rounded-none bg-base border border-hairline flex items-center justify-center shrink-0 z-10 mt-1.5 group-hover:border-program-accent transition-colors">
            <div className="w-1.5 h-1.5 bg-program-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h4 className="font-semibold text-primary leading-tight">{item.event}</h4>
            <div className="flex items-center gap-1.5 text-xs text-muted mt-1 font-mono uppercase tracking-wide">
              {new Date(item.date).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
