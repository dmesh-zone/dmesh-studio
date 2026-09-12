import os

filepath = '/Users/joao/code/dmesh-studio-custom-sample/components/DataProductCostDashboard.tsx'
with open(filepath, 'r') as f:
    code = f.read()

# 1. Layout structure and total cost formatting
old_layout_start = """            {/* Top Row: Total Cost and Pie Charts */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Paper sx={{ width: '250px', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: 'var(--m3-primary-container, #e0f2fe)' }}>
                    <Typography variant="h6" color="text.secondary">Total Cost</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'var(--m3-on-primary-container, #0369a1)' }}>
                        ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2, minWidth: '300px' }}>"""

new_layout_start = """            {/* Top Row: Total Cost */}
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'var(--m3-primary-container, #e0f2fe)' }}>
                <Typography variant="h6" color="text.secondary">Total Cost</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'var(--m3-on-primary-container, #0369a1)' }}>
                    ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
            </Paper>

            {/* Second Row: Pie Charts */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Paper sx={{ flex: 1, p: 2, borderRadius: 2, minWidth: '300px' }}>"""

code = code.replace(old_layout_start, new_layout_start)

# 2. Tooltip formatting
code = code.replace(
    "<Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />",
    "<Tooltip formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} />"
)

# 3. Table format
code = code.replace(
    "${row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}",
    "${row.cost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}"
)

with open(filepath, 'w') as f:
    f.write(code)

print("SUCCESS")
