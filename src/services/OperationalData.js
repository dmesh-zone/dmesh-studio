import YAML from 'yaml';

// Helper to normalize path
const normalizePath = (path) => {
    const base = import.meta.env.BASE_URL || '/';
    return (base + path).replace(/\/\//g, '/');
};

class OperationalData {
    static async getConfig() {
        if (this._configCache) return this._configCache;

        try {
            const configRes = await fetch(normalizePath(`/config/base/config.yaml?t=${Date.now()}`));
            if (!configRes.ok) throw new Error('Failed to load config/base/config.yaml');
            const configText = await configRes.text();
            let configData = YAML.parse(configText) || {};

            // Load customConfig if exists
            try {
                const customRes = await fetch(normalizePath(`/config/custom/config.yaml?t=${Date.now()}`));
                if (customRes.ok) {
                    const customText = await customRes.text();
                    const customData = YAML.parse(customText);
                    if (customData && typeof customData === 'object') {
                        configData = { ...configData, ...customData };
                    }
                }
            } catch (e) {
                console.log('No custom config found or error parsing it', e);
            }

            this._configCache = configData;
            return configData;
        } catch (err) {
            console.error('OperationalData.getConfig error:', err);
            throw err;
        }
    }

    static async getDataMeshOperations() {
        if (this._dataMeshOpsCache) return this._dataMeshOpsCache;
        const configData = await this.getConfig();
        const url = normalizePath(configData.defaultDataMeshOperationalDataUrl);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load dataMeshOperations from ${url}`);
        const text = await res.text();
        const data = YAML.parse(text);
        
        this._dataMeshOpsCache = Array.isArray(data) ? data : [data];
        return this._dataMeshOpsCache;
    }

    static async DataProducts(tierFilter = null) {
        const configData = await this.getConfig();
        const envsData = await this.getDataMeshOperations();
        
        const envList = configData['multi-environment'] || ['Dev', 'QA', 'Prod'];

        const productsMap = new Map();
        const domainsSet = new Set();
        const typesSet = new Set();

        envsData.forEach(envObj => {
            const envName = envObj.env;
            const items = envObj.data || [];

            items.forEach(item => {
                if (item.kind === 'DataProduct') {
                    const type = item.customProperties?.find(p => p.property === 'dataProductTier')?.value || 'dataSource';
                    
                    // Filter early if tierFilter is provided
                    if (tierFilter && type !== tierFilter) return;

                    const id = item.id;
                    const domain = item.domain || 'unknown';
                    const name = item.name || '';
                    const purpose = item.description?.purpose || '';

                    domainsSet.add(domain);
                    typesSet.add(type);

                    const key = `${domain}::${name}`;
                    if (!productsMap.has(key)) {
                        productsMap.set(key, {
                            id,
                            domain,
                            name,
                            purpose,
                            type,
                            envs: new Set()
                        });
                    }
                    productsMap.get(key).envs.add(envName);
                }
            });
        });

        // Calculate highest environment for each product
        const processedProducts = Array.from(productsMap.values()).map(prod => {
            let highestEnv = 'None';
            for (let i = envList.length - 1; i >= 0; i--) {
                const envName = envList[i];
                const match = Array.from(prod.envs).find(e => String(e).toLowerCase() === String(envName).toLowerCase());
                if (match) {
                    highestEnv = envName;
                    break;
                }
            }
            return {
                ...prod,
                highestEnv
            };
        });

        return {
            config: configData,
            environments: envList,
            domains: Array.from(domainsSet).sort(),
            types: Array.from(typesSet).sort(),
            products: processedProducts
        };
    }
}

OperationalData._configCache = null;
OperationalData._dataMeshOpsCache = null;

export default OperationalData;
