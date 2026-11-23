'use client';

import React from 'react';
import type { ParticipantPresence } from '@/lib/proposal-live/types';
import { Users, Eye, Edit3, MessageSquare } from 'lucide-react';

interface PresenceRadarProps {
  participants: ParticipantPresence[];
  currentUserId: string;
}

export function PresenceRadar({ participants, currentUserId }: PresenceRadarProps) {
  const getStatusIcon = (status: ParticipantPresence['status']) => {
    switch (status) {
      case 'typing':
        return <Edit3 className="w-3 h-3 text-amber-500 animate-pulse" />;
      case 'commenting':
        return <MessageSquare className="w-3 h-3 text-emerald-500" />;
      case 'viewing':
      default:
        return <Eye className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2 text-zinc-400 font-medium text-xs uppercase tracking-wider">
        <Users className="w-3.5 h-3.5 text-zinc-400" />
        <span>Live Radar ({participants.length})</span>
      </div>

      <div className="h-4 w-px bg-zinc-800" />

      <div className="flex flex-wrap items-center gap-2">
        {participants.map((participant) => {
          const isSelf = participant.userId === currentUserId;
          return (
            <div
              key={participant.userId}
              className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border border-zinc-700/60 bg-zinc-800/80 hover:bg-zinc-800"
              style={{ borderLeftColor: participant.color, borderLeftWidth: '3px' }}
            >
              <span className="font-medium text-zinc-200">
                {participant.name} {isSelf && <span className="text-zinc-500 font-normal">(You)</span>}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                  participant.role === 'mentor'
                    ? 'bg-purple-900/60 text-purple-300'
                    : 'bg-blue-900/60 text-blue-300'
                }`}
              >
                {participant.role}
              </span>

              {getStatusIcon(participant.status)}

              {participant.activeSection && (
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded font-mono">
                  #{participant.activeSection}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
