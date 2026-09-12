import re

with open('/Users/joao/code/dmesh-studio-custom-sample/components/DataProductCostDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { Box, Typography, Paper, CircularProgress, RadioGroup, FormControlLabel, Radio } from '@mui/material';",
    "import { Box, Typography, Paper, CircularProgress, RadioGroup, FormControlLabel, Radio, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel } from '@mui/material';"
)

content = content.replace(
    "import { useThemeContext } from '../../ThemeContext';",
    "import { useThemeContext } from '../../ThemeContext';\nimport { resolveOdpsPath } from '../../utils/odpsPath';"
)

# 2. State definition
state_insert = """
    const [domainNameCustomisation, setDomainNameCustomisation] = useState<Record<string, string>>({});
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    const formatDomain = React.useCallback((val: string) => {
        if (!val) return '';
        const normalized = String(val).toLowerCase().replace(/\s+/g, '');
        return domainNameCustomisation[normalized] || val;
    }, [domainNameCustomisation]);
"""

content = re.sub(
    r"(const \[selectedTypes, setSelectedTypes\] = useState<string\[\]>\(\[\]\);)",
    r"\1\n" + state_insert,
    content
)

# 3. Use effect update for domainNameCustomisation
content = content.replace(
    "setEnvironments(data.environments);",
    "setEnvironments(data.environments);\n                setDomainNameCustomisation(data.config.domainNameCustomisation || {});"
)

# 4. Domain Selector format domain
content = content.replace(
    "formatDomain={(d: string) => d}",
    "formatDomain={formatDomain}"
)

# 5. Metrics calculation
old_metrics_start = """        filteredProducts.forEach(prod => {
            const name = prod.name || prod.id;
            let cost = 0;"""

new_metrics_start = """        filteredProducts.forEach(prod => {
            const rawName = prod.name || prod.id;
            const businessName = resolveOdpsPath(prod.raw || prod, '_customProperty("dataProductBusinessName")');
            const name = businessName || rawName;
            
            let cost = 0;"""

content = content.replace(old_metrics_start, new_metrics_start)

# In metrics, change costs key lookup to use rawName because the CSV still uses rawName
content = content.replace(
    "cost = costs[`${envFilter}|${name}`] || 0;",
    "cost = costs[`${envFilter}|${rawName}`] || 0;"
)
content = content.replace(
    "cost += costs[`${String(env)}|${name}`] || 0;",
    "cost += costs[`${String(env)}|${rawName}`] || 0;"
)

# Domain array format
content = content.replace(
    "const domainCostArray = Object.keys(domainCost).map(domain => ({ name: domain, value: domainCost[domain] }));",
    "const domainCostArray = Object.keys(domainCost).map(domain => ({ name: formatDomain(domain), value: domainCost[domain] }));"
)

content = content.replace(
    "}, [filteredProducts, costs]);",
    "}, [filteredProducts, costs, formatDomain]);"
)

# 6. Sorting and pagination logic
sorting_logic = """
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTableData = useMemo(() => {
        if (!sortConfig.key) return metrics.tableData;
        return [...metrics.tableData].sort((a, b) => {
            const aVal = a[sortConfig.key as keyof typeof a];
            const bVal = b[sortConfig.key as keyof typeof b];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [metrics.tableData, sortConfig]);

    const paginatedTableData = useMemo(() => {
        return sortedTableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [sortedTableData, page, rowsPerPage]);
"""

content = re.sub(
    r"(const handleTypeToggle = [^\}]+};\n    const handleDomainToggle = [^\}]+};\n)",
    r"\1" + sorting_logic,
    content
)

# 7. Layout change - Top row and pie charts
old_layout = """            {/* Top Row: Total Cost */}
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'var(--m3-primary-container, #e0f2fe)' }}>
                <Typography variant="h6" color="text.secondary">Total Cost</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'var(--m3-on-primary-container, #0369a1)' }}>
                    ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
            </Paper>

            {/* Second Row: Pie Charts */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Cost per Domain</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costByDomain} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {costByDomain.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Cost per Data Product</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costByProduct} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {costByProduct.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Box>"""

new_layout = """            {/* Top Row: Total Cost and Pie Charts */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Paper sx={{ width: '250px', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: 'var(--m3-primary-container, #e0f2fe)' }}>
                    <Typography variant="h6" color="text.secondary">Total Cost</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'var(--m3-on-primary-container, #0369a1)' }}>
                        ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2, minWidth: '300px' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Cost per Domain</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costByDomain} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {costByDomain.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2, minWidth: '300px' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Cost per Data Product</Typography>
                    <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={costByProduct} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {costByProduct.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Box>"""

# Need to replace metrics properties to top-level variables inside render?
# Wait! In the render, it uses `totalCost`, `costByDomain`, `costByProduct`, `tableData` from metrics!
# Right now the destructuring is `const { totalCost, costByDomain, costByProduct, tableData } = useMemo(...)`
# We use `tableData` in the sorting logic, so I need to make sure `tableData` is accessed from `metrics.tableData` if I changed it to `const metrics = useMemo`. But it is actually destructured!
# Let's fix the `sorting_logic` to use `tableData` directly instead of `metrics.tableData`.
sorting_logic = sorting_logic.replace("metrics.tableData", "tableData")

content = re.sub(
    r"(const handleTypeToggle = [^\}]+};\n    const handleDomainToggle = [^\}]+};\n)",
    r"\1" + sorting_logic,
    content
)

content = content.replace(old_layout, new_layout)

# 8. Table Replacement
old_table = """            {/* Third Row: Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--m3-surface-variant, #f1f5f9)' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Data Product Name</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px 16px' }}>{row.name}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.description}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                                        ${row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {tableData.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                                        No data available for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Box>
            </Paper>"""

new_table = """            {/* Third Row: Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead sx={{ '& .MuiTableCell-root': { bgcolor: 'var(--m3-surface-variant, #f1f5f9)', fontWeight: 'bold' } }}>
                            <TableRow>
                                <TableCell>
                                    <TableSortLabel active={sortConfig.key === 'name'} direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'} onClick={() => handleSort('name')}>
                                        Data Product Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={sortConfig.key === 'description'} direction={sortConfig.key === 'description' ? sortConfig.direction : 'asc'} onClick={() => handleSort('description')}>
                                        Description
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel active={sortConfig.key === 'cost'} direction={sortConfig.key === 'cost' ? sortConfig.direction : 'asc'} onClick={() => handleSort('cost')}>
                                        Cost
                                    </TableSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedTableData.map((row, i) => (
                                <TableRow key={i} hover>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>{row.description}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        ${row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedTableData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        No data available for the selected filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={tableData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>"""

content = content.replace(old_table, new_table)

with open('/Users/joao/code/dmesh-studio-custom-sample/components/DataProductCostDashboard.tsx', 'w') as f:
    f.write(content)
