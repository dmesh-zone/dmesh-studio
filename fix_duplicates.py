import os

filepath = '/Users/joao/code/dmesh-studio-custom-sample/components/DataProductCostDashboard.tsx'
with open(filepath, 'r') as f:
    code = f.read()

old_metrics_start = """    // Compute Metrics
    const { totalCost, costByDomain, costByProduct, tableData } = useMemo(() => {
        let total = 0;
        const domainCost: Record<string, number> = {};
        const productCost: { name: string, value: number }[] = [];
        const table: any[] = [];

        filteredProducts.forEach(prod => {
            const rawName = prod.name || prod.id;
            const businessName = resolveOdpsPath(prod, '_customProperty("dataProductBusinessName")');
            const name = businessName || rawName;

            let cost = 0;

            if (envFilter !== 'All') {
                cost = costs[`${envFilter}|${rawName}`] || 0;
            } else {
                Array.from(prod.envs).forEach(env => {
                    cost += costs[`${String(env)}|${rawName}`] || 0;
                });
            }

            total += cost;
            if (!domainCost[prod.domain]) domainCost[prod.domain] = 0;
            domainCost[prod.domain] += cost;

            productCost.push({ name, value: cost });

            table.push({
                name,
                description: prod.description?.purpose || '-',
                cost
            });
        });

        const domainCostArray = Object.keys(domainCost).map(domain => ({ name: formatDomain(domain), value: domainCost[domain] }));
        return { totalCost: total, costByDomain: domainCostArray, costByProduct: productCost, tableData: table };
    }, [filteredProducts, costs, formatDomain, envFilter]);"""

new_metrics_start = """    // Compute Metrics
    const { totalCost, costByDomain, costByProduct, tableData } = useMemo(() => {
        let total = 0;
        const domainCost: Record<string, number> = {};
        const productAggregator: Record<string, { cost: number, description: string }> = {};

        filteredProducts.forEach(prod => {
            const rawName = prod.name || prod.id;
            const businessName = resolveOdpsPath(prod, '_customProperty("dataProductBusinessName")');
            const name = businessName || rawName;

            let cost = 0;

            if (envFilter !== 'All') {
                cost = costs[`${envFilter}|${rawName}`] || 0;
            } else {
                Array.from(prod.envs).forEach(env => {
                    cost += costs[`${String(env)}|${rawName}`] || 0;
                });
            }

            total += cost;
            if (!domainCost[prod.domain]) domainCost[prod.domain] = 0;
            domainCost[prod.domain] += cost;

            if (!productAggregator[name]) {
                productAggregator[name] = { cost: 0, description: prod.description?.purpose || '-' };
            }
            productAggregator[name].cost += cost;
        });

        const domainCostArray = Object.keys(domainCost).map(domain => ({ name: formatDomain(domain), value: domainCost[domain] }));
        
        const productCost = Object.keys(productAggregator).map(name => ({
            name,
            value: productAggregator[name].cost
        }));
        
        const table = Object.keys(productAggregator).map(name => ({
            name,
            description: productAggregator[name].description,
            cost: productAggregator[name].cost
        }));

        return { totalCost: total, costByDomain: domainCostArray, costByProduct: productCost, tableData: table };
    }, [filteredProducts, costs, formatDomain, envFilter]);"""

code = code.replace(old_metrics_start, new_metrics_start)

with open(filepath, 'w') as f:
    f.write(code)

print("SUCCESS")
