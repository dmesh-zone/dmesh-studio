/**
 * Resolves an ODPS descriptor (path) against a product.
 * Supports basic dot notation (e.g. "description.purpose")
 * Supports special functions like _customProperty("propertyName")
 * @param {Object} product - The processed product object (contains raw item, highestEnv, etc.)
 * @param {string} path - The ODPS descriptor path
 * @returns {any} The resolved value
 */
export const resolveOdpsPath = (product, path) => {
    if (!product || !path) return undefined;

    // Special case for pre-computed highestEnv (which isn't in raw ODPS but in our processed wrapper)
    if (path === '_highestEnv') return product.highestEnv;

    const raw = product.raw;
    if (!raw) return undefined;

    // Special case for customProperties: _customProperty("propertyName")
    const customPropMatch = path.match(/^_customProperty\(['"](.*?)['"]\)$/);
    if (customPropMatch) {
        const propName = customPropMatch[1];
        if (Array.isArray(raw.customProperties)) {
            const match = raw.customProperties.find(p => p.property === propName);
            return match ? match.value : undefined;
        }
        return undefined;
    }

    // Standard dot-notation JSONPath (very basic implementation)
    // E.g. "description.purpose" -> ['description', 'purpose']
    const parts = path.split('.');
    let current = raw;
    
    for (const part of parts) {
        if (current === undefined || current === null) return undefined;
        
        // Check for array index e.g. "outputPorts[0]"
        const arrayMatch = part.match(/([^\[]+)\[(\d+)\]/);
        if (arrayMatch) {
            const key = arrayMatch[1];
            const index = parseInt(arrayMatch[2], 10);
            current = current[key];
            if (Array.isArray(current)) {
                current = current[index];
            } else {
                return undefined;
            }
        } else {
            current = current[part];
        }
    }

    return current;
};
