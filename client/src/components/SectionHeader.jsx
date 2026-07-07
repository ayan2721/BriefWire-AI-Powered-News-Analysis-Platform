import React from 'react';

function SectionHeader({ eyebrow, title, action = null }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white lg:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;

