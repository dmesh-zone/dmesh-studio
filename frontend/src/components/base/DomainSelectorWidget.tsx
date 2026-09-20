/*
 * Copyright 2026 Joao Vicente
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DomainSelectorWidgetProps {
    domains: string[];
    selectedDomains: string[];
    onChange: (domains: string[]) => void;
    formatDomain?: (domain: string) => string;
}

const DomainSelectorWidget: React.FC<DomainSelectorWidgetProps> = React.memo(({ domains, selectedDomains, onChange, formatDomain = (d: string) => d }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Local state for immediate UI updates (no debounce)
    const [localSelectedDomains, setLocalSelectedDomains] = useState(selectedDomains);

    // Sync local state when external selectedDomains changes
    useEffect(() => {
        setLocalSelectedDomains(selectedDomains);
    }, [selectedDomains]);

    // Use useRef to store timeout for proper cleanup
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Debounced callback to parent for filtering logic
    const debouncedOnChange = useCallback((newDomains: string[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            onChange(newDomains);
        }, 100); // Shorter debounce for selections
    }, [onChange]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, []);

    const toggleDomain = (domain: string) => {
        const newSelection = localSelectedDomains.includes(domain)
            ? localSelectedDomains.filter(d => d !== domain)
            : [...localSelectedDomains, domain];

        setLocalSelectedDomains(newSelection); // Immediate UI update
        debouncedOnChange(newSelection); // Debounced parent update
    };

    const selectAll = () => {
        setLocalSelectedDomains(domains); // Immediate UI update
        onChange(domains); // Immediate update for select all (no debounce needed)
    };

    const clearAll = () => {
        setLocalSelectedDomains([]); // Immediate UI update
        onChange([]); // Immediate update for clear all (no debounce needed)
    };

    const labelText = localSelectedDomains.length === 0
        ? 'All Domains'
        : localSelectedDomains.length === domains.length
            ? 'All Domains'
            : `${localSelectedDomains.length} Domain${localSelectedDomains.length > 1 ? 's' : ''}`;

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {/* Trigger Button - Styled to match Flow.jsx inputs */}
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
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    zIndex: 20,
                    backgroundColor: 'var(--input-bg, #ffffff)',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    minWidth: '200px',
                    maxHeight: '60vh',
                    overflowY: 'auto'
                }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--m3-outline, #64748b)', marginBottom: '4px' }}>Select Domains</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {domains.map((domain: string) => (
                            <label key={domain} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', padding: '2px 0', color: 'var(--m3-on-surface, #334155)' }}>
                                <input
                                    type="checkbox"
                                    checked={localSelectedDomains.includes(domain)}
                                    onChange={() => toggleDomain(domain)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {formatDomain(domain)}
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--m3-surface-variant, #f1f5f9)' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={selectAll}
                            style={{ flex: 1, fontSize: '11px', padding: '4px 8px' }}
                        >
                            Select All
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={clearAll}
                            style={{ flex: 1, fontSize: '11px', padding: '4px 8px' }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default DomainSelectorWidget;
