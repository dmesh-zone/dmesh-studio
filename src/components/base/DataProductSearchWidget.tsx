import React from 'react';

interface DataProductSearchWidgetProps {
    filterText: string;
    onFilterChange: (text: string) => void;
}

const DataProductSearchWidget: React.FC<DataProductSearchWidgetProps> = ({ filterText, onFilterChange }) => {
    return (
        <div className="input-container-style" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            minWidth: '300px'
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
                type="text"
                placeholder="Search ..."
                value={filterText}
                onChange={(e) => onFilterChange(e.target.value)}
                style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    color: 'var(--m3-on-surface, #334155)',
                    background: 'transparent'
                }}
            />
            {filterText && (
                <button
                    className="btn btn-ghost"
                    onClick={() => onFilterChange('')}
                    style={{
                        padding: 0,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default DataProductSearchWidget;
