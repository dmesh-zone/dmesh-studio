import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    TableContainer,
    Paper,
    CircularProgress,
    Drawer,
    IconButton,
    Divider,
    Tooltip,
    Link,
    Menu,
    MenuItem
} from '@mui/material';
import ExcelJS from 'exceljs';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useThemeContext } from '../../ThemeContext';
import DomainSelector from '../../DomainSelector';
import GlobalFilter from '../../GlobalFilter';
import OperationalData from '../../services/OperationalData';
import { resolveOdpsPath } from '../../utils/odpsPath';

export const formatType = (type) => {
    if (!type) return '';
    return type
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
};

const TypeSelector = ({ types, selectedTypes, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, []);

    const toggleType = (type) => {
        if (selectedTypes.includes(type)) {
            onChange(selectedTypes.filter(t => t !== type));
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
                        {types.map(type => (
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

export default function DataProductTabular({ title, tierFilter = null, customControls, renderAboveTable, renderTable, tableDescriptor, sidePanelDescriptor }) {
    const { mode } = useThemeContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productsList, setProductsList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Configurations
    const [environments, setEnvironments] = useState(['Dev', 'QA', 'Prod']);
    const [allDomains, setAllDomains] = useState([]);
    const [allTypes, setAllTypes] = useState([]);
    const [domainNameCustomisation, setDomainNameCustomisation] = useState({});
    const [iconMap, setIconMap] = useState({});
    const [technologyNameMap, setTechnologyNameMap] = useState({});

    // Filter states
    const [envFilter, setEnvFilter] = useState('');
    const [selectedDomains, setSelectedDomains] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [searchText, setSearchText] = useState('');

    // Pagination & Sorting
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Side panel state and resizing logic
    const [sidePanelWidth, setSidePanelWidth] = useState(1000);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = React.useCallback((mouseDownEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((mouseMoveEvent) => {
        if (isResizing) {
            const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
            if (newWidth > 300 && newWidth < 1200) {
                setSidePanelWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await OperationalData.DataProducts(tierFilter);
                
                setProductsList(data.products);
                setAllDomains(data.domains);
                setAllTypes(data.types);
                setEnvironments(data.environments);
                setDomainNameCustomisation(data.config.domainNameCustomisation || {});
                setIconMap(data.config.iconMap || {});
                setTechnologyNameMap(data.config.technologyNameMap || {});

                // Initialize environment filter
                const defaultEnv = data.config['default-environment'] || data.environments[data.environments.length - 1];
                const storedEnv = localStorage.getItem('dmesh-selected-env');
                const envToSet = storedEnv && data.environments.includes(storedEnv) ? storedEnv : defaultEnv;
                setEnvFilter(envToSet);

                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        load();
    }, [tierFilter]);

    // Local Storage for Environment & Domains
    useEffect(() => {
        if (envFilter && envFilter !== 'All') {
            localStorage.setItem('dmesh-selected-env', envFilter);
        }
    }, [envFilter]);

    useEffect(() => {
        const savedDomains = localStorage.getItem('dmesh-selected-domains');
        if (savedDomains && allDomains.length > 0 && selectedDomains.length === 0) {
            try {
                const parsed = JSON.parse(savedDomains);
                if (Array.isArray(parsed) && parsed.every(d => allDomains.includes(d))) {
                    setSelectedDomains(parsed);
                }
            } catch (e) {
                console.error("Failed to parse saved domains", e);
            }
        }
    }, [allDomains]);

    useEffect(() => {
        if (selectedDomains.length > 0) {
            localStorage.setItem('dmesh-selected-domains', JSON.stringify(selectedDomains));
        } else if (allDomains.length > 0) {
            localStorage.removeItem('dmesh-selected-domains');
        }
    }, [selectedDomains, allDomains]);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return productsList.filter(prod => {
            // Environment Filter
            if (envFilter !== 'All') {
                const hasEnv = Array.from(prod.envs).some(e => String(e).toLowerCase() === String(envFilter).toLowerCase());
                if (!hasEnv) return false;
            }
            // Domain Filter
            if (selectedDomains.length > 0 && !selectedDomains.includes(prod.domain)) return false;
            // Type Filter
            if (selectedTypes.length > 0 && !selectedTypes.includes(prod.type)) return false;
            // Search Filter
            if (searchText) {
                const query = searchText.toLowerCase();
                const matchesName = prod.name.toLowerCase().includes(query);
                const matchesId = prod.id.toLowerCase().includes(query);
                const matchesPurpose = prod.purpose.toLowerCase().includes(query);
                const matchesDomain = prod.domain.toLowerCase().includes(query);
                if (!matchesName && !matchesId && !matchesPurpose && !matchesDomain) return false;
            }
            return true;
        });
    }, [productsList, envFilter, selectedDomains, selectedTypes, searchText]);

    // Reset page to 0 when filters change
    useEffect(() => {
        setPage(0);
    }, [envFilter, selectedDomains, selectedTypes, searchText]);

    const sortedProducts = useMemo(() => {
        let sortableItems = [...filteredProducts];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = resolveOdpsPath(a, sortConfig.key);
                let bVal = resolveOdpsPath(b, sortConfig.key);
                
                const colDef = tableDescriptor.find(c => c.odpsDescriptor === sortConfig.key);
                if (colDef && colDef.textMapper) {
                    const ctx = { formatDomain, formatTechnology, formatType, iconMap, technologyNameMap };
                    aVal = colDef.textMapper(aVal, ctx);
                    bVal = colDef.textMapper(bVal, ctx);
                }

                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredProducts, sortConfig, tableDescriptor, domainNameCustomisation, technologyNameMap]);

    // Export Logic
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const openExportMenu = Boolean(exportAnchorEl);

    const handleExportClick = (event) => setExportAnchorEl(event.currentTarget);
    const handleExportClose = () => setExportAnchorEl(null);

    const generateExportData = () => {
        const effectiveTable = tableDescriptor || [
            { columnName: "Domain", odpsDescriptor: "domain", textMapper: (val, ctx) => ctx.formatDomain(val) },
            { columnName: "Type", odpsDescriptor: "_customProperty(\"dataProductTier\")", textMapper: (val, ctx) => ctx.formatType(val) },
            { columnName: "Data Product Name", odpsDescriptor: "name" },
            { columnName: "Purpose", odpsDescriptor: "description.purpose" },
            { columnName: "Stage", odpsDescriptor: "_highestEnv" }
        ];

        const header = [];
        effectiveTable.forEach(col => header.push(col.columnName));
        
        const effectiveSidePanel = sidePanelDescriptor || [
            { name: "Data Product Name", odpsDescriptor: "name" },
            { name: "Domain Technical Name", odpsDescriptor: "domain", textMapper: (val, ctx) => ctx.formatDomain(val) }
        ];
        
        effectiveSidePanel.forEach(field => header.push(field.name));

        const data = [header];
        const ctx = { formatDomain, formatTechnology, formatType, iconMap, technologyNameMap };

        sortedProducts.forEach(prod => {
            const row = [];
            // Table columns
            effectiveTable.forEach(col => {
                let val = resolveOdpsPath(prod, col.odpsDescriptor);
                if (col.textMapper) val = col.textMapper(val, ctx);
                row.push(val !== undefined && val !== null ? String(val) : '');
            });
            // Side panel fields
            effectiveSidePanel.forEach(field => {
                let val = resolveOdpsPath(prod, field.odpsDescriptor);
                if (field.textMapper) val = field.textMapper(val, ctx);
                row.push(val !== undefined && val !== null ? String(val) : '');
            });
            data.push(row);
        });
        return data;
    };

    const getExportFilename = () => {
        const safeTitle = typeof title === 'string' ? title.replace(/\s+/g, '_') : 'DataExport';
        return `${safeTitle}_${new Date().toISOString().split('T')[0]}`;
    };

    const handleExportCSV = () => {
        const data = generateExportData();
        const csvContent = data.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${getExportFilename()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleExportClose();
    };

    const handleExportXLSX = async () => {
        const data = generateExportData();
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Export');
        sheet.addRows(data);
        const buffer = await workbook.xlsx.writeBuffer();
        
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${getExportFilename()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        handleExportClose();
    };

    const paginatedProducts = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedProducts.slice(start, start + rowsPerPage);
    }, [sortedProducts, page, rowsPerPage]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const formatDomain = (d) => domainNameCustomisation[d] || d;
    const formatTechnology = (val) => {
        if (!val) return val;
        const normalized = String(val).toLowerCase().replace(/\s+/g, '');
        return technologyNameMap?.[normalized] || val;
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, color: 'error.main' }}>
                <Typography variant="h6">Error Loading Data Products</Typography>
                <Typography variant="body2">{error}</Typography>
            </Box>
        );
    }

    const renderDynamicTable = () => {
        const columns = tableDescriptor || [
            { columnName: "Domain", odpsDescriptor: "domain", textMapper: (val, ctx) => ctx.formatDomain(val) },
            { columnName: "Type", odpsDescriptor: "_customProperty(\"dataProductTier\")", textMapper: (val, ctx) => ctx.formatType(val) },
            { columnName: "Data Product Name", odpsDescriptor: "name", sidePanelLink: true },
            { columnName: "Purpose", odpsDescriptor: "description.purpose" },
            { columnName: "Stage", odpsDescriptor: "_highestEnv", displayFormat: "chip" }
        ];
        
        return (
            <TableContainer component={Paper} sx={{ bgcolor: 'var(--m3-surface, #ffffff)', border: '1px solid var(--m3-outline-variant, #e2e8f0)', backgroundImage: 'none', color: 'inherit', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} onClick={() => col.odpsDescriptor && handleSort(col.odpsDescriptor)} style={{ cursor: col.odpsDescriptor ? 'pointer' : 'default', userSelect: 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {col.columnName}
                                        {col.odpsDescriptor && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', opacity: sortConfig.key === col.odpsDescriptor ? 1 : 0.4 }}>
                                                {sortConfig.key === col.odpsDescriptor && sortConfig.direction === 'desc' ? <polyline points="6 9 12 15 18 9"></polyline> : sortConfig.key === col.odpsDescriptor && sortConfig.direction === 'asc' ? <polyline points="18 15 12 9 6 15"></polyline> : <><polyline points="7 10 12 5 17 10"></polyline><polyline points="7 14 12 19 17 14"></polyline></>}
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map((prod) => (
                            <tr key={prod.id}>
                                {columns.map((col, i) => {
                                    let val = resolveOdpsPath(prod, col.odpsDescriptor);
                                    if (col.textMapper) val = col.textMapper(val, { formatDomain, formatTechnology, formatType, iconMap, technologyNameMap });
                                    
                                    let content = val;
                                    if (col.displayFormat === 'chip') {
                                        content = <span className="custom-chip" style={{ fontSize: '11px', padding: '2px 8px', fontWeight: 'bold' }}>{val}</span>;
                                    }
                                    
                                    if (col.iconMapper && val) {
                                        const normalized = String(val).toLowerCase().replace(/\s+/g, '');
                                        let imgSrc = iconMap?.[normalized] || `/icons/${normalized}.svg`;
                                        if (imgSrc && !imgSrc.startsWith('http')) {
                                            const base = import.meta.env.BASE_URL || '/';
                                            imgSrc = (base + imgSrc).replace(/\/\//g, '/');
                                        }
                                        content = (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {imgSrc && <img src={imgSrc} alt="" style={{ width: '16px', height: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                                                <span>{content}</span>
                                            </div>
                                        );
                                    } else if (col.imageMapper) {
                                        let imgSrc = col.imageMapper(val, { formatDomain, formatTechnology, formatType, iconMap, technologyNameMap });
                                        if (imgSrc && !imgSrc.startsWith('http')) {
                                            const base = import.meta.env.BASE_URL || '/';
                                            imgSrc = (base + imgSrc).replace(/\/\//g, '/');
                                        }
                                        content = (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {imgSrc && <img src={imgSrc} alt="" style={{ width: '16px', height: '16px' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                                                <span>{content}</span>
                                            </div>
                                        );
                                    }

                                    if (col.sidePanelLink) {
                                        content = (
                                            <Link 
                                                component="button"
                                                variant="body2"
                                                onClick={() => setSelectedProduct(prod)}
                                                sx={{ 
                                                    cursor: 'pointer', 
                                                    fontWeight: '500', 
                                                    textAlign: 'left',
                                                    fontFamily: 'inherit',
                                                    fontSize: 'inherit'
                                                }}
                                            >
                                                {content}
                                            </Link>
                                        );
                                    }

                                    return <td key={i}>{content}</td>;
                                })}
                            </tr>
                        ))}
                        {sortedProducts.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--m3-on-surface-variant, #6b7280)' }}>
                                    No data products match the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            
            {/* Pagination Footer */}
            {sortedProducts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--m3-outline-variant, #e2e8f0)', fontSize: '13px', color: 'var(--m3-on-surface, #334155)', backgroundColor: 'var(--table-row-bg, #ffffff)' }}>
                    <div>
                        {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, sortedProducts.length)} of {sortedProducts.length}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Rows per page:</span>
                            <select 
                                value={rowsPerPage} 
                                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
                                style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--m3-outline-variant, #e2e8f0)', fontSize: '13px', backgroundColor: 'transparent' }}
                            >
                                {[10, 25, 50, 100].map(val => (
                                    <option key={val} value={val}>{val}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => setPage(0)} disabled={page === 0} style={{ background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.3 : 1, color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
                            </button>
                            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{ background: 'none', border: 'none', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.3 : 1, color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button onClick={() => setPage(Math.min(Math.ceil(sortedProducts.length / rowsPerPage) - 1, page + 1))} disabled={page >= Math.ceil(sortedProducts.length / rowsPerPage) - 1} style={{ background: 'none', border: 'none', cursor: page >= Math.ceil(sortedProducts.length / rowsPerPage) - 1 ? 'default' : 'pointer', opacity: page >= Math.ceil(sortedProducts.length / rowsPerPage) - 1 ? 0.3 : 1, color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                            <button onClick={() => setPage(Math.ceil(sortedProducts.length / rowsPerPage) - 1)} disabled={page >= Math.ceil(sortedProducts.length / rowsPerPage) - 1} style={{ background: 'none', border: 'none', cursor: page >= Math.ceil(sortedProducts.length / rowsPerPage) - 1 ? 'default' : 'pointer', opacity: page >= Math.ceil(sortedProducts.length / rowsPerPage) - 1 ? 0.3 : 1, color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </TableContainer>
        );
    };

    return (
        <Box sx={{ pt: 1.5, pb: 4, px: 4, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, bgcolor: 'var(--m3-surface, #ffffff)', color: 'var(--m3-on-surface, #334155)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'inherit' }}>
                    {title}
                </Typography>
                
                <Box>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={handleExportClick}
                        sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                        underline="none"
                    >
                        Export <ExpandMoreIcon fontSize="small" />
                    </Link>
                    <Menu
                        anchorEl={exportAnchorEl}
                        open={openExportMenu}
                        onClose={handleExportClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem onClick={handleExportCSV}>Export CSV</MenuItem>
                        <MenuItem onClick={handleExportXLSX}>Export XLSX</MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Filter Panel */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', mb: 1 }}>
                {/* Environment Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff', px: 2, py: '2px', borderRadius: '8px', border: '1px solid', borderColor: 'divider', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '32px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', mr: 0.5 }}>
                        Environment:
                    </Typography>
                    <RadioGroup row value={envFilter} onChange={(e) => setEnvFilter(e.target.value)} sx={{ gap: 0.5, flexWrap: 'nowrap' }}>
                        {environments.map((env) => (
                            <FormControlLabel key={env} value={env}
                                control={<Radio size="small"
                                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="var(--radio-border, #64748b)" strokeWidth="2" /></svg>}
                                    checkedIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="var(--radio-selected-border, #111111)" strokeWidth="2.5" /><circle cx="12" cy="12" r="4" fill="var(--radio-selected-dot, #111111)" /></svg>}
                                    sx={{ padding: '2px', '&.Mui-focusVisible': { outline: '2px solid #ff5500', outlineOffset: '2px' } }}
                                />}
                                label={env}
                                sx={{ margin: 0, '& .MuiFormControlLabel-label': { fontSize: '0.75rem', color: 'text.primary', pr: 0.5 } }}
                            />
                        ))}
                    </RadioGroup>
                </Box>

                <DomainSelector domains={allDomains} selectedDomains={selectedDomains} onChange={setSelectedDomains} formatDomain={formatDomain} />
                
                {/* Only show type selector if there are multiple types (some specific tiers may only have 1 type) */}
                {allTypes.length > 1 && (
                    <TypeSelector types={allTypes} selectedTypes={selectedTypes} onChange={setSelectedTypes} />
                )}

                <GlobalFilter filterText={searchText} onFilterChange={setSearchText} />
                
                {customControls && customControls}
            </Box>

            {renderAboveTable && renderAboveTable({ sortedProducts })}
            {renderTable ? renderTable({ 
                paginatedProducts, 
                sortedProducts,
                handleSort, 
                sortConfig, 
                formatType, 
                formatDomain,
                formatTechnology,
                iconMap,
                technologyNameMap,
                page,
                rowsPerPage,
                setPage,
                setRowsPerPage
            }) : renderDynamicTable()}
            
            {/* Side Panel Drawer */}
            <Drawer 
                anchor="right" 
                open={Boolean(selectedProduct)} 
                onClose={() => setSelectedProduct(null)}
                PaperProps={{ 
                    sx: { 
                        width: `${sidePanelWidth}px`, 
                        minWidth: '300px',
                        maxWidth: '1200px',
                        borderRadius: '24px 0 0 24px',
                        bgcolor: 'var(--m3-surface)', 
                        color: 'var(--m3-on-surface)',
                        transition: isResizing ? 'none' : undefined,
                    } 
                }}
            >
                {/* Resize Handle */}
                <div
                    onMouseDown={startResizing}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '5px',
                        cursor: 'ew-resize',
                        zIndex: 21,
                        background: 'transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                />

                {selectedProduct && (
                    <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {resolveOdpsPath(selectedProduct, '_customProperty("dataProductBusinessName")') || selectedProduct.name}
                            </Typography>
                            <IconButton onClick={() => setSelectedProduct(null)} size="small"><CloseIcon /></IconButton>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {(sidePanelDescriptor || [
                                { name: "Data Product Name", odpsDescriptor: "name" },
                                { name: "Domain Technical Name", odpsDescriptor: "domain", textMapper: (val, ctx) => ctx.formatDomain(val) }
                            ]).map((field, i) => {
                                let val = resolveOdpsPath(selectedProduct, field.odpsDescriptor);
                                if (field.textMapper) val = field.textMapper(val, { formatDomain, formatTechnology, formatType, iconMap, technologyNameMap });
                                return (
                                    <Box key={i}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                            {field.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word', pt: 0.5 }}>
                                                {val !== undefined && val !== null && val !== '' ? val : '-'}
                                            </Typography>
                                            {val !== undefined && val !== null && val !== '' && (
                                                <Tooltip title="Copy">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => navigator.clipboard.writeText(String(val))}
                                                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 }, p: 0.5 }}
                                                    >
                                                        <ContentCopyIcon sx={{ fontSize: '0.875rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
}
