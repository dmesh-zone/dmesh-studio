# Architecture Fitness Functions

## Overview

The **Architecture Fitness Dashboard** is an internal capability of DMesh Studio that evaluates your imported Data Mesh definitions (Data Products and Data Contracts) against a defined set of organizational standards and target architectural expectations.

These evaluations act as "fitness functions" that continuously assert the health and compliance of your architectural state, rather than just purely structural schema validation.

## How It Works

The dashboard runs a series of discrete **Rules**. Each rule is a JavaScript function that receives a Data Product or Data Contract object and returns an evaluation result.

The results categorize objects into:
- **Passed**: The object aligns with the rule.
- **Warning**: The object deviates from best practices but is structurally sound.
- **Error**: The object violates a strict architectural constraint.

When a Data Product or Data Contract is selected in the UI, failing or warning rules are displayed as actionable insights.

## Rule Structure

A rule is defined using the `Rule` interface:

```typescript
export interface Rule {
    id: string;             // Unique identifier for the rule
    label: string;          // Human-readable rule description
    severity: 'warning' | 'error'; // Impact of the violation
    evaluate: (item: any) => { passed: boolean; reason?: string }; // The fitness logic
    source?: string;        // E.g., 'base rules' or 'custom rules'
}
```

## Customizing Rules

In enterprise environments, you'll often have bespoke architectural rules (e.g., naming conventions, specific mandatory custom properties). 

DMesh Studio provides a simple mechanism to extend, override, or suppress base rules without altering the core codebase. This is achieved by creating a custom page inside a custom peer repository (e.g. `dmesh-studio-custom-sample`).

### Extending Rules via Customization

1. Create a custom file matching the base path in your custom repository: `pages/ArchitectureFitness/index.tsx`.
2. Import the base rules and the `extendRules` helper from the core repository.
3. Define your custom rule modifications (new rules, overrides, or suppressions).
4. Export the modified rules arrays as `dataProductRules` and `dataContractRules`.

**Example:**

```typescript
import { 
    dataProductRules as baseDataProductRules, 
    dataContractRules as baseDataContractRules,
    extendRules,
    RuleExtension
} from '../../../dmesh-studio/frontend/src/pages/base/ArchitectureFitness';

// Define custom extensions
const customDataProductRules: RuleExtension[] = [
    // 1. Suppress a base rule you disagree with
    {
        id: 'dp-must-have-readme',
        suppressed: true
    },
    // 2. Override an existing rule (e.g., changing severity)
    {
        id: 'api-version-supported',
        severity: 'warning' // Downgrade from error to warning
    },
    // 3. Add an entirely new rule specific to your organization
    {
        id: 'custom-org-namespace',
        label: "Data Products must use the correct organizational namespace",
        severity: 'error',
        evaluate: (dp: any) => {
            if (!dp.name.startsWith('org.')) {
                return { passed: false, reason: "Name does not start with 'org.'" };
            }
            return { passed: true };
        }
    }
];

// Export the finalized, merged rule sets
export const dataProductRules = extendRules(baseDataProductRules, customDataProductRules);
export const dataContractRules = extendRules(baseDataContractRules, []); // No changes to contracts

// Re-export the dashboard component natively
export { default } from '../../../dmesh-studio/frontend/src/pages/base/ArchitectureFitness';
```

When you build your custom application (using `python3 scripts/base/customization.py`), your custom `ArchitectureFitness/index.tsx` will dynamically override the base page, injecting your bespoke architectural rules natively into DMesh Studio's dashboard.
