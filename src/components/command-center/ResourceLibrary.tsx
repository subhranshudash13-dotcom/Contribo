import React from 'react';
import { DETAILED_GUIDES } from './data';

export function ResourceLibrary() {
  const guides = Object.values(DETAILED_GUIDES);
  
  return (
    <div className="py-8 space-y-8 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-heading font-semibold text-primary mb-4">Resource Library</h2>
        <p className="text-secondary max-w-2xl mx-auto">
          Explore detailed guides, templates, and best practices to help you navigate open source contributions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map(guide => {
          const Icon = guide.icon;
          return (
            <div key={guide.id} className="p-6 bg-surface border border-hairline rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{guide.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-tertiary">{guide.category}</span>
                </div>
              </div>
              <div className="text-sm">
                {guide.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
