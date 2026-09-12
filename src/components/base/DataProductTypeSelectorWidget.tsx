import React, { useState, useEffect, useRef } from 'react';

// Lifted generic formatter from DataProductTabular
export const formatType = (type: string) => {
    if (!type) return '';
    return type
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};

interface DataProductTypeSelectorWidgetProps {
    types: string[];
    selectedTypes: string[];
    onChange: (types: string[]) => void;
}

const DataProductTypeSelectorWidget: React.FC<DataProductTypeSelectorWidgetProps> = ({ types, selectedTypes, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, []);

    const toggleType = (type: string) => {
        if (selectedTypes.includes(type)) {
            onChange(selectedTypes.filter((t: string) => t !== type));
        } else {
            onChange([...selectedTypes, type]);
        }
    };

    const labelText = selectedTypes.length === 0
        ? 'All Types'
        : selectedTypes.length === types.length
            ? 'All Types'
            : selectedTypes.length === 1
                ? formatType(selectedTypes[0])
                : `${selectedTypes.length} Types`;

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <div
                className="input-container-style"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    minWidth: '150px',
                    userSelect: 'none'
                }}
            >
                <span style={{ fontSize: '13px', color: 'var(--m3-on-surface, #334155)', flex: 1 }}>{labelText}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 20,
                    backgroundColor: 'var(--input-bg, #ffffff)', padding: '10px', borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid var(--m3-outline-variant, #e2e8f0)', display: 'flex', flexDirection: 'column', gap: '5px',
                    minWidth: '200px', maxHeight: '60vh', overflowY: 'auto'
                }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--m3-outline, #64748b)', marginBottom: '4px' }}>Select Types</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {types.map((type: string) => (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', padding: '2px 0', color: 'var(--m3-on-surface, #334155)' }}>
                                <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} style={{ cursor: 'pointer' }} />
                                {formatType(type)}
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--m3-surface-variant, #f1f5f9)' }}>
                        <button className="btn btn-secondary" onClick={() => onChange(types)} style={{ flex: 1, fontSize: '11px', padding: '4px 8px' }}>Select All</button>
                        <button className="btn btn-secondary" onClick={() => onChange([])} style={{ flex: 1, fontSize: '11px', padding: '4px 8px' }}>Clear</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataProductTypeSelectorWidget;
