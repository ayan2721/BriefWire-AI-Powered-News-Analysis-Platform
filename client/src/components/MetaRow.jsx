import React from 'react';

function MetaRow({ items = [], className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${className}`}>
      {items.map((item, idx) => (
        <React.Fragment key={`${item.label ?? idx}-${idx}`}>
          <span className="text-slate-400">{item.label}</span>
          {idx < items.length - 1 ? <span className="text-slate-600">•</span> : null}
        </React.Fragment>
      ))}
    </div>
  );
}

export default MetaRow;

