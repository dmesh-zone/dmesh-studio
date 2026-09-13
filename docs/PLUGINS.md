# Lifecycle Plugins

DMesh Studio provides a headless plugin architecture that allows both the base application and custom modules to execute logic in the background, independently of the UI component tree.

## Plugin Interface

All plugins must implement the `AppPlugin` interface defined in `frontend/src/types/AppPlugin.ts`. 

```typescript
import { AppContextType } from '../contexts/AppContext';

export interface AppPlugin {
    /** 
     * Executed exactly once when the application finishes loading its initial state.
     */
    onReload?: (context: AppContextType) => void | Promise<void>;
    
    /** 
     * Executed periodically based on the configured intervals.
     */
    onTimer?: Array<{
        intervalMs: number;
        callback: (context: AppContextType) => void | Promise<void>;
    }>;
}
```

## Plugin Location

Plugins are automatically discovered using Vite's `import.meta.glob`.
*   **Base Plugins:** `frontend/src/plugins/base/`
*   **Custom Plugins:** `frontend/src/plugins/custom/` (Synchronized via `customization.py` from your custom repository's `plugins` folder)

## Example Custom Plugin

The following example shows how to create a plugin that dispatches a global notification on app reload and every 10 seconds. You can view the complete source code for this example in [`demoPlugin.ts`](https://github.com/dmesh-zone/dmesh-studio-custom-sample/tree/main/plugins/demoPlugin.ts).

```typescript
import { AppContextType } from '../../dmesh-studio/frontend/src/contexts/AppContext';

function getTimeString() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

const demoPlugin = {
    onReload: (context: AppContextType) => {
        // You have access to the context here, so you can check user roles or feature flags
        window.dispatchEvent(new CustomEvent('show-notification', {
            detail: {
                message: `onReload sample plugin executed [${getTimeString()}]`,
                duration: 2000
            }
        }));
    },
    onTimer: [
        {
            intervalMs: 10000,
            callback: (context: AppContextType) => {
                window.dispatchEvent(new CustomEvent('show-notification', {
                    detail: {
                        message: `onTimer custom plugin executed [${getTimeString()}]`,
                        duration: 2000
                    }
                }));
            }
        }
    ]
};

export default demoPlugin;
```

## Available Context

When your hooks (`onReload` or `onTimer`) run, they receive a proxied `AppContextType` object. This gives you safe read/write access to the application state:
*   `context.user`: The active user profile
*   `context.isAuthenticated`: Boolean auth status
*   `context.config`: Full application configuration (`config.yaml`)
*   `context.setUser`, `context.updateConfig`, `context.logout`: Mutation functions
