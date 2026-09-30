import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    Tooltip,
    IconButton,
    Drawer,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import TagIcon from '@mui/icons-material/Tag';
import InteractiveYaml from '../../InteractiveYaml';
import EnvironmentSelectorWidget from './EnvironmentSelectorWidget';
import DomainSelectorWidget from './DomainSelectorWidget';
import OperationalData from '../../services/OperationalData';
import { resolveOdpsPath } from '../../utils/odpsPath';

export interface FitnessCategory {
    id: string;
    label: string;
    targetKind: string;
    rules: Rule[];
}

export interface Rule {
    id: string;
    label: string;
    severity: 'error' | 'warning';
    evaluate: (dp: any) => { passed: boolean; reason?: string };
    source?: 'base rules' | 'custom rules';
}

interface ArchitectureFitnessDashboardProps {
    categories?: FitnessCategory[];
    rules?: Rule[];
}

export default function ArchitectureFitnessDashboard({ categories = [], rules = [] }: ArchitectureFitnessDashboardProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [environments, setEnvironments] = useState<string[]>(['Dev', 'QA', 'Prod']);
    const [selectedEnv, setSelectedEnv] = useState<string>('');
    const [dataMeshOps, setDataMeshOps] = useState<any[]>([]);

    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [sidePanelData, setSidePanelData] = useState<any>(null);
    const [sidePanelFilter, setSidePanelFilter] = useState<string>('');
    const [domainNameCustomisation, setDomainNameCustomisation] = useState<any>({});
    const [hideCompliantRules, setHideCompliantRules] = useState<boolean>(() => {
        const stored = localStorage.getItem('dmesh-hide-compliant-rules');
        return stored !== null ? stored === 'true' : false;
    });

    useEffect(() => {
        localStorage.setItem('dmesh-hide-compliant-rules', String(hideCompliantRules));
    }, [hideCompliantRules]);

    const [drawerWidth, setDrawerWidth] = useState(1000);
    const isResizing = React.useRef(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 300 && newWidth < window.innerWidth * 0.95) {
                setDrawerWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            if (isResizing.current) {
                isResizing.current = false;
                document.body.style.cursor = 'default';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleMouseDown = () => {
        isResizing.current = true;
        document.body.style.cursor = 'ew-resize';
    };

    const activeCategories = useMemo(() => {
        if (categories && categories.length > 0) return categories;
        if (rules && rules.length > 0) {
            return [{
                id: 'default',
                label: 'Data Product Specification compliance rules',
                targetKind: 'DataProduct',
                rules
            }];
        }
        return [];
    }, [categories, rules]);


    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const envsData = await OperationalData.getDataMeshOperations();
                const configData = await OperationalData.getConfig();

                setDomainNameCustomisation(configData.domainNameCustomisation || {});

                const isMultiEnv = envsData.some(item => item.env !== undefined);
                let envList = configData['multi-environment'];

                if (!envList || !Array.isArray(envList)) {
                    if (isMultiEnv) {
                        envList = Array.from(new Set(envsData.map(e => e.env).filter(Boolean)));
                    } else {
                        envList = ['Dev', 'QA', 'Prod'];
                    }
                }
                setEnvironments(envList);
                setDataMeshOps(envsData);

                const defaultEnv = configData['default-environment'] || envList[envList.length - 1];
                const storedEnv = localStorage.getItem('dmesh-selected-env');
                const envToSet = storedEnv && envList.includes(storedEnv) ? storedEnv : defaultEnv;

                const urlParams = new URLSearchParams(window.location.search);
                const envParam = urlParams.get('env');
                if (envParam && envList.includes(envParam)) {
                    setSelectedEnv(envParam);
                } else {
                    setSelectedEnv(envToSet);
                }
            } catch (err: any) {
                console.error("Failed to load operations", err);
                setError(err.message || "Failed to load data");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const updateEnv = (newEnv: string) => {
        setSelectedEnv(newEnv);
        localStorage.setItem('dmesh-selected-env', newEnv);
        const url = new URL(window.location.href);
        url.searchParams.set('env', newEnv);
        window.history.replaceState({}, '', url.toString());
    };

    const currentEnvData = useMemo(() => {
        if (!selectedEnv || dataMeshOps.length === 0) return [];
        const isMultiEnv = dataMeshOps.some(item => item.env !== undefined);
        let items: any[] = [];
        if (isMultiEnv) {
            const envObj = dataMeshOps.find(e => e.env === selectedEnv);
            if (envObj && envObj.data) {
                items = envObj.data;
            }
        } else {
            dataMeshOps.forEach(obj => {
                if (obj.data) items = items.concat(obj.data);
                else items.push(obj);
            });
        }

        // Build mapping of contractId to all domains and data products that reference it
        const contractIdToProducts = new Map<string, { domain: string, dataProductId: string }[]>();
        items.forEach(item => {
            if (item.kind === 'DataProduct' && item.domain && item.id) {
                if (item.outputPorts && Array.isArray(item.outputPorts)) {
                    item.outputPorts.forEach((port: any) => {
                        if (port.contractId) {
                            if (!contractIdToProducts.has(port.contractId)) {
                                contractIdToProducts.set(port.contractId, []);
                            }
                            // Avoid exact duplicates
                            const existing = contractIdToProducts.get(port.contractId)!;
                            if (!existing.some(p => p.domain === item.domain && p.dataProductId === item.id)) {
                                existing.push({ domain: item.domain, dataProductId: item.id });
                            }
                        }
                    });
                }
            }
        });
        // Create multiple instances of DataContracts - one for each data product that references them
        const mappedItems: any[] = [];
        items.forEach(item => {
            if (item.kind === 'DataContract') {
                if (item.id && contractIdToProducts.has(item.id)) {
                    //Create one instance per data product that references this contract
                    const products = contractIdToProducts.get(item.id)!;
                    products.forEach(prod => {
                        mappedItems.push({
                            ...item,
                            domain: prod.domain,
                            dataProductId: prod.dataProductId,
                            // Create unique ID for each instance to avoid conflicts
                            _instanceId: `${item.id}_${prod.dataProductId}`,
                            _originalItem: item
                        });
                    });
                }
                else {
                    // Do not include orphaned data contracts in the dashboard evaluations
                    // mappedItems.push(item);
                }
            } else {
                // Keep all non-DataContract items as-is
                mappedItems.push(item);
            }
        });

        return mappedItems;
    }, [selectedEnv, dataMeshOps]);

    const allDomains = useMemo(() => {
        const domains = new Set<string>();
        currentEnvData.forEach(dp => {
            if (dp.domain) domains.add(dp.domain);
        });
        return Array.from(domains).sort();
    }, [currentEnvData]);

    const filteredEnvData = useMemo(() => {
        if (selectedDomains.length === 0) return currentEnvData;
        return currentEnvData.filter(dp => selectedDomains.includes(dp.domain));
    }, [currentEnvData, selectedDomains]);

    const categoryDomainStats = useMemo(() => {
        const stats: Record<string, Record<string, { rulesPassed: number, rulesError: number, rulesWarning: number }>> = {};

        activeCategories.forEach(cat => {
            stats[cat.id] = {};

            // Initialise stats for all domains
            filteredEnvData.forEach(dp => {
                const domain = dp.domain || 'Unknown';
                if (!stats[cat.id][domain]) stats[cat.id][domain] = { rulesPassed: 0, rulesError: 0, rulesWarning: 0 };
            });

            // Calculate rule compliance per domain - each rule gets one status per domain
            Object.keys(stats[cat.id]).forEach(domain => {
                const domainData = filteredEnvData.filter(dp => (dp.domain || 'Unknown') === domain && dp.kind === cat.targetKind);

                cat.rules.forEach(rule => {
                    if (domainData.length === 0) return;

                    // Check if any item in this domain fails this rule
                    let ruleFailure = false;
                    for (const item of domainData) {
                        const targetForEvaluation = item._originalItem || item;
                        if (!rule.evaluate(targetForEvaluation).passed) {
                            ruleFailure = true;
                            break;
                        }
                    }

                    // Count this rule once per domain based on its worst outcome in that domain
                    if (ruleFailure) {
                        if (rule.severity === 'error') stats[cat.id][domain].rulesError++;
                        if (rule.severity === 'warning') stats[cat.id][domain].rulesWarning++;
                    } else {
                        stats[cat.id][domain].rulesPassed++;
                    }
                });
            });
        });

        return stats;
    }, [filteredEnvData, activeCategories]);

    const categoryResults = useMemo(() => {
        const resultsByCat: Record<string, any[]> = {};
        activeCategories.forEach(cat => {
            const catData = filteredEnvData.filter(dp => dp.kind === cat.targetKind);
            resultsByCat[cat.id] = cat.rules.map(rule => {
                let compliantCount = 0;
                let uncompliantCount = 0;
                const failures: { dp: any; reason: string }[] = [];
                const domainStats: Record<string, { compliant: number, uncompliant: number }> = {};

                catData.forEach(dp => {
                    const domain = dp.domain || 'Unknown';
                    if (!domainStats[domain]) domainStats[domain] = { compliant: 0, uncompliant: 0 };

                    const targetForEvaluation = dp._originalItem || dp;
                    const res = rule.evaluate(targetForEvaluation);
                    if (res.passed) {
                        if (domain !== 'Unknown') compliantCount++;
                        domainStats[domain].compliant++;
                    } else {
                        if (domain !== 'Unknown') uncompliantCount++;
                        domainStats[domain].uncompliant++;
                        if (domain !== "Unknown") failures.push({ dp, reason: res.reason! });
                    }
                });

                return {
                    ...rule,
                    compliantCount,
                    uncompliantCount,
                    failures,
                    domainStats
                };
            });
        });
        return resultsByCat;
    }, [activeCategories, filteredEnvData]);

    const globalCategoryStats = useMemo(() => {
        const statsByCat: Record<string, { rulesPassed: number, rulesError: number, rulesWarning: number }> = {};
        activeCategories.forEach(cat => {
            statsByCat[cat.id] = { rulesPassed: 0, rulesError: 0, rulesWarning: 0 };
            const results = categoryResults[cat.id] || [];
            results.forEach(res => {
                if (res.uncompliantCount > 0) {
                    if (res.severity === 'error') statsByCat[cat.id].rulesError++;
                    else statsByCat[cat.id].rulesWarning++;
                } else {
                    statsByCat[cat.id].rulesPassed++;
                }
            });
        });
        return statsByCat;
    }, [categoryResults, activeCategories]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Error loading data: {error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header Area */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2
            }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--m3-on-surface)' }}>
                    Architecture Fitness
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>

                    <EnvironmentSelectorWidget
                        environments={environments}
                        envFilter={selectedEnv}
                        setEnvFilter={updateEnv}
                    />
                    <DomainSelectorWidget
                        domains={allDomains}
                        selectedDomains={selectedDomains}
                        onChange={setSelectedDomains}
                        formatDomain={(d) => domainNameCustomisation[d] || d}
                    />
                </Box>
            </Box>

            {/* Content Area */}
            <Paper elevation={0} sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid var(--m3-outline-variant)',
                bgcolor: 'background.paper'
            }}>
                {(Object.keys(categoryDomainStats).length > 0) && (() => {
                    const sortedDomains = Array.from(new Set(filteredEnvData.map(dp => dp.domain).filter(d => d && d !== 'Unknown'))).sort() as string[];
                    return (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: 'var(--m3-on-surface)' }}>
                                Architecture fitness summary
                            </Typography>
                            <div style={{ border: '1px solid var(--m3-outline-variant)', borderRadius: '8px', overflow: 'auto', backgroundColor: 'var(--m3-surface)' }}>
                                <table className="custom-table">
                                    <thead>
                                        <tr>
                                            <th style={{ position: 'sticky', left: 0, zIndex: 2, textAlign: 'left' }}>Category</th>
                                            {sortedDomains.map(domain => (
                                                <th key={domain} style={{ textAlign: 'center' }}>{domainNameCustomisation[domain] || domain}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeCategories.map(cat => (
                                            <tr key={cat.id}>
                                                <td style={{ position: 'sticky', left: 0, zIndex: 1, fontWeight: 'bold' }}>{cat.label}</td>
                                                {sortedDomains.map(domain => {
                                                    const stats = categoryDomainStats[cat.id]?.[domain] || { rulesPassed: 0, rulesError: 0, rulesWarning: 0 };
                                                    return (
                                                        <td key={domain} style={{ textAlign: 'center' }}>
                                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Passed Rules">
                                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                        {stats.rulesPassed}
                                                                    </Typography>
                                                                </Box>
                                                                {stats.rulesError > 0 && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Errored Rules">
                                                                        <ErrorIcon color="error" fontSize="small" />
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                                            {stats.rulesError}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {stats.rulesWarning > 0 && (
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Warning Rules">
                                                                        <WarningIcon color="warning" fontSize="small" />
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                                                            {stats.rulesWarning}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Box>
                    );
                })()}

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2, ml: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setHideCompliantRules(!hideCompliantRules)}
                        sx={{ textTransform: 'none', borderRadius: 8, borderColor: 'var(--m3-outline)', color: 'var(--m3-on-surface)' }}
                    >
                        {hideCompliantRules ? 'Show compliant rules' : 'Hide compliant rules'}
                    </Button>
                </Box>

                {activeCategories.map(cat => {
                    const stats = globalCategoryStats[cat.id];
                    const results = categoryResults[cat.id] || [];
                    return (
                        <Accordion key={cat.id} elevation={0} sx={{ background: 'transparent', '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Typography variant="h6" sx={{ color: 'var(--m3-on-surface)' }}>
                                        {cat.label}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Passed Rules">
                                            <CheckCircleIcon color="success" fontSize="small" />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                {stats.rulesPassed}
                                            </Typography>
                                        </Box>
                                        {stats.rulesError > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Errored Rules">
                                                <ErrorIcon color="error" fontSize="small" />
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                                    {stats.rulesError}
                                                </Typography>
                                            </Box>
                                        )}
                                        {stats.rulesWarning > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Warning Rules">
                                                <WarningIcon color="warning" fontSize="small" />
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                                    {stats.rulesWarning}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0, py: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {results.filter(r => !hideCompliantRules || r.uncompliantCount > 0).length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 2 }}>
                                            All rules in this category are compliant.
                                        </Typography>
                                    ) : results.filter(r => !hideCompliantRules || r.uncompliantCount > 0).map((result) => (
                                        <Accordion
                                            key={result.id}
                                            elevation={0}
                                            sx={{
                                                border: '1px solid var(--m3-outline-variant)',
                                                borderRadius: '8px !important',
                                                '&:before': { display: 'none' },
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        {result.uncompliantCount === 0 ? (
                                                            <Chip
                                                                label="PASS"
                                                                size="small"
                                                                color="success"
                                                                sx={{ fontWeight: 'bold', fontSize: '0.7rem', minWidth: '70px' }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label={result.severity.toUpperCase()}
                                                                size="small"
                                                                color={result.severity === 'error' ? 'error' : 'warning'}
                                                                sx={{ fontWeight: 'bold', fontSize: '0.7rem', minWidth: '70px' }}
                                                            />
                                                        )}
                                                        <Typography sx={{ fontWeight: 500, color: 'var(--m3-on-surface)' }}>
                                                            {result.label}
                                                        </Typography>
                                                        <Tooltip title={
                                                            <React.Fragment>
                                                                Rule ID: {result.id}<br />
                                                                Rule defined in: {result.source || 'base rules'}<br />
                                                                <span style={{ opacity: 0.8, fontStyle: 'italic' }}>click to copy Rule ID</span>
                                                            </React.Fragment>
                                                        }>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(result.id);
                                                                }}
                                                                sx={{ color: 'text.secondary', ml: -1 }}
                                                            >
                                                                <TagIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                                                            Compliant: {result.compliantCount}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: result.uncompliantCount > 0 ? 'error.main' : 'text.secondary', fontWeight: 500 }}>
                                                            Uncompliant: {result.uncompliantCount}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ bgcolor: 'var(--m3-surface)', p: 0, display: 'flex', flexDirection: 'column' }}>
                                                {result.failures.length > 0 ? (
                                                    <div style={{ overflow: 'auto', borderRadius: '4px', border: '1px solid var(--m3-outline-variant)' }}>
                                                        <table className="custom-table">
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ textAlign: 'left' }}>Violating Item</th>
                                                                    <th style={{ textAlign: 'left' }}>Failure Reason</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {result.failures.map((f: any, idx: number) => {
                                                                    const domain = f.dp.domain || 'unknown';
                                                                    const name = f.dp.name || f.dp.id || 'unknown';
                                                                    let dpLink = `/mesh/domain/${domain}/dataproduct/${f.dp.id}?env=${selectedEnv}`;
                                                                    if (f.dp.kind === 'DataContract' && f.dp.dataProductId) {
                                                                        dpLink = `/mesh/domain/${domain}/dataproduct/${f.dp.dataProductId}/contract/${f.dp.id}?env=${selectedEnv}&domains=*`;
                                                                    }
                                                                    return (
                                                                        <tr key={idx}>
                                                                            <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <Link to={dpLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--m3-primary)', textDecoration: 'none' }}>
                                                                                    {domain}.{name}
                                                                                </Link>
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSidePanelData(f.dp.originalData || f.dp);
                                                                                    }}
                                                                                    title="View YAML"
                                                                                    sx={{ p: 0.5 }}
                                                                                >
                                                                                    <DescriptionIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </td>
                                                                            <td style={{ color: 'var(--health-critical, #EF4444)' }}>{f.reason}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <Box sx={{ p: 2 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            All items are compliant with this rule.
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )
                })}

            </Paper>

            <Drawer
                anchor="right"
                open={Boolean(sidePanelData)}
                onClose={() => {
                    setSidePanelData(null);
                    setSidePanelFilter('');
                }}
                sx={{ '& .MuiDrawer-paper': { width: Math.min(drawerWidth, window.innerWidth * 0.95), display: 'flex', flexDirection: 'column', bgcolor: 'var(--side-panel-bg, #f8fafc)' } }}
            >
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '5px',
                        cursor: 'ew-resize',
                        backgroundColor: 'transparent',
                        zIndex: 10
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid var(--side-panel-container-border, #e5e7eb)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">{sidePanelData?.kind === 'DataContract' ? 'Data Contract' : 'Data Product'} YAML</Typography>
                        {sidePanelData?.kind === 'DataContract' && (
                            <a
                                href={`https://bitol-io.github.io/open-data-contract-standard/${sidePanelData.apiVersion || 'v3.2.0'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="custom-chip custom-chip-interactive"
                                style={{ textDecoration: 'none' }}
                            >
                                Open Data Contract Standard {(sidePanelData.apiVersion || 'v3.2.0').toUpperCase()}
                            </a>
                        )}
                        {sidePanelData?.kind === 'DataProduct' && (
                            <a
                                href={`https://bitol-io.github.io/open-data-product-standard/${sidePanelData.apiVersion || 'v1.1.0'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="custom-chip custom-chip-interactive"
                                style={{ textDecoration: 'none' }}
                            >
                                Open Data Product Standard {(sidePanelData.apiVersion || 'v1.1.0').toUpperCase()}
                            </a>
                        )}
                    </Box>
                    <IconButton onClick={() => { setSidePanelData(null); setSidePanelFilter(''); }} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {sidePanelData && (
                    <Box sx={{ p: 2, borderBottom: '1px solid var(--side-panel-container-border, #e5e7eb)', bgcolor: 'var(--side-panel-bg, #f8fafc)' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                className="custom-input"
                                placeholder="Filter YAML..."
                                value={sidePanelFilter}
                                onChange={(e) => setSidePanelFilter(e.target.value)}
                                style={{ paddingRight: '24px', width: '100%', boxSizing: 'border-box' }}
                            />
                            {sidePanelFilter && (
                                <button
                                    onClick={() => setSidePanelFilter('')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        fontSize: '14px',
                                        padding: 0
                                    }}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    </Box>
                )}

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                    {sidePanelData && (
                        <InteractiveYaml data={sidePanelData} filterText={sidePanelFilter} />
                    )}
                </Box>
            </Drawer>
        </Box>
    );
}
