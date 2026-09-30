import React from 'react';
import ArchitectureFitnessDashboard, { Rule, FitnessCategory } from '../../../components/base/ArchitectureFitnessDashboard';

export type RuleExtension = Partial<Rule> & { id: string, suppressed?: boolean };

// Helper function to easily add, override, or suppress rules
export function extendRules(baseRules: Rule[], overrides: RuleExtension[]): Rule[] {
    const overrideMap = new Map(overrides.map(r => [r.id, r]));
    const result: Rule[] = [];

    for (const rule of baseRules) {
        if (!overrideMap.has(rule.id)) {
            result.push({ ...rule, source: rule.source || 'base rules' });
            continue;
        }

        const override = overrideMap.get(rule.id)!;
        if (override.suppressed) {
            overrideMap.delete(rule.id);
            continue;
        }

        result.push({ ...rule, ...override, source: 'custom rules' } as Rule);
        overrideMap.delete(rule.id);
    }

    // Add any remaining overrides (new rules)
    const remaining = Array.from(overrideMap.values()).map(r => ({ ...r, source: 'custom rules' })) as Rule[];
    result.push(...remaining);
    return result;
}

export const dataProductRules: Rule[] = [
    {
        id: 'apiVersion-supported',
        label: "All Data Products have a 'apiVersion' property that is supported (v1.1.0)",
        severity: 'error',
        evaluate: (dp: any) => {
            const supportedVersion = 'v1.1.0'
            if (dp.apiVersion !== supportedVersion) {
                return { passed: false, reason: `apiVersion is '${dp.apiVersion || 'undefined'}'. Supported version: ${supportedVersion}` };
            }
            return { passed: true };
        }
    },
    {
        id: 'kind-valid',
        label: "All Data Products have a 'kind' property with 'DataProduct' value",
        severity: 'error',
        evaluate: (dp: any) => {
            if (dp.kind !== 'DataProduct') return { passed: false, reason: `'kind' is '${dp.kind}' instead of 'DataProduct'` };
            return { passed: true };
        }
    },
    {
        id: 'id-valid',
        label: "All Data Products have a valid 'id' property (using UUID v5 format)",
        severity: 'error',
        evaluate: (dp: any) => {
            const uuidv5Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!dp.id) return { passed: false, reason: "Missing 'id' property" };
            if (!uuidv5Regex.test(dp.id)) return { passed: false, reason: `'id' is not in UUID v5 format: ${dp.id}` };
            return { passed: true };
        }
    },
    {
        id: 'type-valid',
        label: "All Data Products have a 'type' property with values 'dataSource|sourceAligned|curated|consumerAligned|application'",
        severity: 'error',
        evaluate: (dp: any) => {
            const dpType = dp.type;
            if (!dpType) return { passed: false, reason: "Missing 'type' property" };
            if (!['dataSource', 'sourceAligned', 'curated', 'consumerAligned', 'application'].includes(dpType)) {
                return { passed: false, reason: `Invalid 'type' value: '${dpType}'` };
            }
            return { passed: true };
        }
    },
    {
        id: 'name-exists',
        label: "All Data Products have a 'name' property",
        severity: 'error',
        evaluate: (dp: any) => {
            if (!dp.name) return { passed: false, reason: "Missing 'name' property" };
            return { passed: true };
        }
    },
    {
        id: 'name-convention-valid',
        label: "All Data Products have a 'name' property following snake case naming convention",
        severity: 'warning',
        evaluate: (dp: any) => {
            if (!dp.name) return { passed: true }; // skipped if no name
            if (!/^[a-z0-9]+(_[a-z0-9]+)*$/.test(dp.name)) return { passed: false, reason: `Name '${dp.name}' is not in snake_case` };
            return { passed: true };
        }
    },
    {
        id: 'version-valid',
        label: "All Data Products have a valid 'version' property (e.g. v1 or v1.0.0)",
        severity: 'error',
        evaluate: (dp: any) => {
            if (!/^v\d+(?:\.\d+\.\d+)?$/.test(dp.version || '')) {
                return { passed: false, reason: `Version is '${dp.version || 'undefined'}' instead of a valid format (e.g. v1 or v1.0.0)` };
            }
            return { passed: true };
        }
    },
    {
        id: 'status-valid',
        label: "All Data Products have a 'status' property with valid values",
        severity: 'error',
        evaluate: (dp: any) => {
            const validStatuses = ['proposed', 'draft', 'active', 'deprecated', 'retired'];
            if (!validStatuses.includes(dp.status)) {
                return { passed: false, reason: `Status is '${dp.status || 'undefined'}'. Expected one of: ${validStatuses.join(', ')}` };
            }
            return { passed: true };
        }
    },
    {
        id: 'domain-valid',
        label: "All Data Products have a non-empty 'domain' property",
        severity: 'error',
        evaluate: (dp: any) => {
            if (!dp.domain || typeof dp.domain !== 'string' || dp.domain.trim() === '') return { passed: false, reason: "Missing or empty 'domain' property" };
            return { passed: true };
        }
    },
    {
        id: 'description-purpose-exists',
        label: "All Data Products (except dataSource and application) have a 'description.purpose' property",
        severity: 'warning',
        evaluate: (dp: any) => {
            const tier = dp.type;
            if (tier && (tier === 'dataSource' || tier === 'application')) {
                return { passed: true };
            }
            if (!dp.description || !dp.description.purpose) return { passed: false, reason: "Missing 'description.purpose' property" };
            return { passed: true };
        }
    },
    {
        id: 'outputPorts-expected',
        label: "Data Products of tier sourceAligned/curated/consumerAligned should have 'outputPorts' array",
        severity: 'warning',
        evaluate: (dp: any) => {
            const tier = dp.type;
            if (tier && ['sourceAligned', 'curated', 'consumerAligned'].includes(tier)) {
                if (!dp.outputPorts || !Array.isArray(dp.outputPorts)) {
                    return { passed: false, reason: `'outputPorts' array is missing or invalid for tier '${tier}'` };
                }
            }
            return { passed: true };
        }
    },
    {
        id: 'outputPorts-valid',
        label: "All elements in 'outputPorts' must contain valid 'name', 'version', and 'contractId' (UUID v5) properties",
        severity: 'error',
        evaluate: (dp: any) => {
            const uuidv5Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (Array.isArray(dp.outputPorts)) {
                for (let i = 0; i < dp.outputPorts.length; i++) {
                    const op = dp.outputPorts[i];
                    if (!op.name) {
                        return { passed: false, reason: `Output port at index ${i} is missing the 'name' property` };
                    }
                    if (!/^v\d+(?:\.\d+\.\d+)?$/.test(op.version || '')) {
                        return { passed: false, reason: `Output port at index ${i} has an invalid version format: '${op.version}'` };
                    }
                    if (!op.contractId || !uuidv5Regex.test(op.contractId)) {
                        return { passed: false, reason: `Output port at index ${i} has an invalid or missing 'contractId' in UUID v5 format: '${op.contractId || 'undefined'}'` };
                    }
                }
            }
            return { passed: true };
        }
    },
    {
        id: 'technology-customProperty-valid',
        label: "All Data Products have a valid 'technology' customProperty",
        severity: 'error',
        evaluate: (dp: any) => {
            const techProp = dp.customProperties?.find((p: any) => p.property === 'technology');
            if (!techProp) return { passed: false, reason: "Missing 'technology' custom property" };
            if (typeof techProp.value !== 'string' || techProp.value.trim() === '') return { passed: false, reason: "The 'technology' custom property value is empty" };
            return { passed: true };
        }
    },
    {
        id: 'dataUsageAgreements-customProperty-valid',
        label: "Data Products of specific tiers must have valid 'dataUsageAgreements' customProperty",
        severity: 'warning',
        evaluate: (dp: any) => {
            const uuidv5Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            const tier = dp.type;
            if (tier && ['dataSource', 'sourceAligned', 'curated'].includes(tier)) {
                const agreementsProp = dp.customProperties?.find((p: any) => p.property === 'dataUsageAgreements');
                if (!agreementsProp || !Array.isArray(agreementsProp.value)) {
                    return { passed: false, reason: `Missing or invalid 'dataUsageAgreements' array for tier '${tier}'` };
                }
                for (let i = 0; i < agreementsProp.value.length; i++) {
                    const agreement = agreementsProp.value[i];
                    if (!agreement.info || agreement.info.active !== true) {
                        return { passed: false, reason: `Agreement at index ${i} is missing 'info.active: true'` };
                    }
                    const consumerId = agreement.consumer?.dataProductId;
                    if (!consumerId || !uuidv5Regex.test(consumerId)) {
                        return { passed: false, reason: `Agreement at index ${i} has an invalid or missing 'consumer.dataProductId' in UUID v5 format` };
                    }
                }
            }
            return { passed: true };
        }
    },


];

export const dataContractRules: Rule[] = [
    {
        id: 'apiVersion-supported',
        label: "All Data Contracts have a 'apiVersion' property that is supported (v3.2.0)",
        severity: 'error',
        evaluate: (dc: any) => {
            const supportedVersion = 'v3.2.0'
            if (dc.apiVersion !== supportedVersion) {
                return { passed: false, reason: `apiVersion is '${dc.apiVersion || 'undefined'}'. Supported version: ${supportedVersion}` };
            }
            return { passed: true };
        }
    },
    {
        id: 'kind-valid',
        label: "All Data Contracts have a 'kind' property with 'DataContract' value",
        severity: 'error',
        evaluate: (dc: any) => {
            if (dc.kind !== 'DataContract') return { passed: false, reason: `'kind' is '${dc.kind}' instead of 'DataContract'` };
            return { passed: true };
        }
    },
    {
        id: 'id-valid',
        label: "All Data Contracts have an 'id' in UUID v5 format",
        severity: 'error',
        evaluate: (dc: any) => {
            const uuidv5Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!dc.id) return { passed: false, reason: "Missing 'id' property" };
            if (!uuidv5Regex.test(dc.id)) return { passed: false, reason: `'id' is not in UUID v5 format: ${dc.id}` };
            return { passed: true };
        }
    },
    {
        id: 'version-valid',
        label: "All Data Contracts have a valid 'version' property (e.g. v1 or v1.0.0)",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!/^v\d+(?:\.\d+\.\d+)?$/.test(dc.version || '')) {
                return { passed: false, reason: `Version is '${dc.version || 'undefined'}' instead of a valid format (e.g. v1 or v1.0.0)` };
            }
            return { passed: true };
        }
    },
    {
        id: 'status-valid',
        label: "All Data Contracts have a 'status' property with valid values",
        severity: 'error',
        evaluate: (dc: any) => {
            const validStatuses = ['proposed', 'draft', 'active', 'deprecated', 'retired'];
            if (!validStatuses.includes(dc.status)) {
                return { passed: false, reason: `Status is '${dc.status || 'undefined'}'. Expected one of: ${validStatuses.join(', ')}` };
            }
            return { passed: true };
        }
    },
    {
        id: 'domain-exists',
        label: "All Data Contracts have a non-empty 'domain' property",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!dc.domain || typeof dc.domain !== 'string' || dc.domain.trim() === '') return { passed: false, reason: "Missing or empty 'domain' property" };
            return { passed: true };
        }
    },
    {
        id: 'dataProduct-deprecated',
        label: "Data Contracts should not have a 'dataProduct' property (deprecated)",
        severity: 'warning',
        evaluate: (dc: any) => {
            if (dc.dataProduct && typeof dc.dataProduct === 'string' && dc.dataProduct.trim() !== '') return { passed: false, reason: "Data Contracts should not have a 'dataProduct' property (deprecated)" };
            return { passed: true };
        }
    },
    {
        id: 'servers-valid',
        label: "All Data Contracts have valid 'servers' property",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!dc.servers || !Array.isArray(dc.servers) || dc.servers.length === 0) {
                return { passed: false, reason: "Missing or empty 'servers' array" };
            }
            const requiredProps = ['host', 'type', 'schema', 'server', 'catalog', 'environment'];
            for (let i = 0; i < dc.servers.length; i++) {
                const s = dc.servers[i];
                for (const prop of requiredProps) {
                    if (!s[prop] || typeof s[prop] !== 'string' || s[prop].trim() === '') {
                        return { passed: false, reason: `Server at index ${i} is missing or has an empty '${prop}' property` };
                    }
                }
            }
            return { passed: true };
        }
    },
    {
        id: 'dataProductId-valid',
        label: "All Data Contracts have a 'dataProductId' custom property in uuid v5 format",
        severity: 'error',
        evaluate: (dc: any) => {
            const uuidv5Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            const dataProductIdProp = dc.customProperties?.find((p: any) => p.property === 'dataProductId');
            if (!dataProductIdProp || !dataProductIdProp.value || typeof dataProductIdProp.value !== 'string' || !uuidv5Regex.test(dataProductIdProp.value)) return { passed: false, reason: "Missing or invalid 'dataProductId' custom property" };
            return { passed: true };
        }
    },
    {
        id: 'roles-valid',
        label: "All Data Contracts have a non-empty 'roles' property with valid role, access, and description",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!dc.roles || !Array.isArray(dc.roles) || dc.roles.length === 0) {
                return { passed: false, reason: "Missing or empty 'roles' array" };
            }
            for (let i = 0; i < dc.roles.length; i++) {
                const r = dc.roles[i];
                if (!r.role || typeof r.role !== 'string' || r.role.trim() === '') {
                    return { passed: false, reason: `Role at index ${i} is missing or has an empty 'role' property` };
                }
                if (!r.access || typeof r.access !== 'string' || r.access.trim() === '') {
                    return { passed: false, reason: `Role at index ${i} is missing or has an empty 'access' property` };
                }
                if (!r.description || typeof r.description !== 'string' || r.description.trim() === '') {
                    return { passed: false, reason: `Role at index ${i} is missing or has an empty 'description' property` };
                }
            }
            return { passed: true };
        }
    },
    {
        id: 'schema-not-empty',
        label: "All Data Contracts have a 'schema' array with at least one entry",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!dc.schema || !Array.isArray(dc.schema) || dc.schema.length === 0) {
                return { passed: false, reason: "Missing or empty 'schema' array" };
            }
            return { passed: true };
        }
    },
    {
        id: 'schema-name-not-empty',
        label: "All schemas in a Data Contract have a non-empty 'name' property",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!dc.schema || !Array.isArray(dc.schema)) return { passed: true };
            for (let i = 0; i < dc.schema.length; i++) {
                const s = dc.schema[i];
                if (!s.name || typeof s.name !== 'string' || s.name.trim() === '') {
                    return { passed: false, reason: `Schema at index ${i} is missing or has an empty 'name' property` };
                }
            }
            return { passed: true };
        }
    },
    {
        id: 'schema-properties-valid',
        label: "All schemas have a 'properties' array that is not empty and contains 'name', 'logicalType', and 'physicalType'",
        severity: 'error',
        evaluate: (dc: any) => {
            if (!dc.schema || !Array.isArray(dc.schema)) return { passed: true };
            for (let i = 0; i < dc.schema.length; i++) {
                const s = dc.schema[i];
                if (!s.properties || !Array.isArray(s.properties) || s.properties.length === 0) {
                    return { passed: false, reason: `Schema '${s.name || i}' is missing or has an empty 'properties' array` };
                }
                for (let j = 0; j < s.properties.length; j++) {
                    const prop = s.properties[j];
                    if (!prop.name || typeof prop.name !== 'string' || prop.name.trim() === '') {
                        return { passed: false, reason: `Property at index ${j} in schema '${s.name || i}' is missing or has an empty 'name'` };
                    }
                    if (!prop.logicalType || typeof prop.logicalType !== 'string' || prop.logicalType.trim() === '') {
                        return { passed: false, reason: `Property '${prop.name || j}' in schema '${s.name || i}' is missing or has an empty 'logicalType'` };
                    }
                    if (!prop.physicalType || typeof prop.physicalType !== 'string' || prop.physicalType.trim() === '') {
                        return { passed: false, reason: `Property '${prop.name || j}' in schema '${s.name || i}' is missing or has an empty 'physicalType'` };
                    }
                }
            }
            return { passed: true };
        }
    }
];

export const categories: FitnessCategory[] = [
    {
        id: 'data-product',
        label: 'Data Product Specification compliance rules',
        targetKind: 'DataProduct',
        rules: dataProductRules
    },
    {
        id: 'data-contract',
        label: 'Data Contract Specification compliance rules',
        targetKind: 'DataContract',
        rules: dataContractRules
    }
];

export default function ArchitectureFitness() {
    return <ArchitectureFitnessDashboard categories={categories} />;
}
