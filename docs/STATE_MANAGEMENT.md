# State Management in DMesh Studio

DMesh Studio utilizes a centralized state management architecture to provide seamless integration between the core platform and custom extensions. This document outlines how state is managed through the `AppContext`, configuration files, and custom React components.

## Overview

The global state of the application is maintained by the `AppContext`. It is a React Context that securely wraps the entire application and exposes the following core pieces of state:

1. **Authentication State:** Whether a user is currently logged in (`isAuthenticated`).
2. **User Profile:** Detailed information about the active user (`user`), including their roles and custom preferences.
3. **Application Configuration:** Dynamic configuration elements (`config`) loaded from `config.yaml`.

You can access and manipulate this state in any React component using the `useAppContext()` hook.

---

## 1. Global Configuration (`config.yaml`)

Application configuration is primarily driven by the `config.yaml` files. DMesh Studio intelligently merges the `app` block from the base configuration (`dmesh-studio/frontend/public/config/base/config.yaml`) with the custom configuration (`dmesh-studio-custom-sample/config/config.yaml`).

This combined configuration is injected directly into `AppContext.config`.

### Common Configuration Sections

*   **`services`**: Used to decouple external service URLs from the codebase.
*   **`features`**: Used as a registry for Feature Flags, allowing you to toggle UI components without code deployments.

**Example `config.yaml`:**
```yaml
app:
  features:
    customUserFeatureFlag: true
  services:
    costManagementService: "https://example.com/cost-management"
```

In your custom components, you can read these values safely:
```tsx
const { config } = useAppContext();
const costServiceUrl = config.services?.costManagementService;
const isMyFeatureEnabled = config.features?.customUserFeatureFlag;
```

---

## 2. User State (`UserProfile`)

When a user logs in, the `AppContext` stores their session data as a `UserProfile` object. This object contains standard attributes like `id`, `name`, `email`, and an array of `roles`.

### Custom Attributes

To allow custom deployments to store proprietary user preferences (e.g., UI layout toggles, last visited pages, theme selections) without modifying the core TypeScript definitions, the `UserProfile` includes a schema-less dictionary called `customAttributes`.

```tsx
const { user } = useAppContext();

// Accessing a custom attribute
const myCustomValue = user?.customAttributes?.someKey;
```

---

## 3. Using State in Custom Code

To interact with the global state in your custom React pages or components, import the `useAppContext` hook from `../../../hooks`. 

### Reading State
```tsx
import { useAppContext } from '../../../hooks';
import { Typography } from '@mui/material';

export default function MyCustomComponent() {
  const { user, isAuthenticated, config } = useAppContext();

  if (!isAuthenticated) return <Typography>Please log in.</Typography>;

  return <Typography>Welcome, {user.name}!</Typography>;
}
```

### Mutating State
The `AppContext` also exposes mutation functions to update the global state dynamically:

*   **`setUser(profile)`**: Sets or updates the active user.
*   **`updateConfig(partialConfig)`**: Merges new configuration values into the running context.
*   **`logout()`**: Clears the current user session.

**Example of adding a role:**
```tsx
const { user, setUser } = useAppContext();

const addAdminRole = () => {
    if (user && !user.roles.includes("admin")) {
        setUser({
            ...user,
            roles: [...user.roles, "admin"]
        });
    }
};
```

---

## 4. The "State Demo" Reference

For a complete, working example of how to manage and manipulate the application state, refer to the **State Demo** page provided in the custom sample repository.

*   **Location:** `dmesh-studio-custom-sample/pages/StateDemo/index.tsx`

This demonstration page illustrates:
*   How to hydrate a mock `UserProfile` based on a configuration feature flag (`customUserFeatureFlag`).
*   How to dynamically add and remove user roles.
*   How to inject arbitrary key-value pairs into the user's `customAttributes`.
*   How to inspect the raw JSON output of the `AppContext` in real-time. 

When developing new custom pages that rely on specific user roles, dynamic service URLs, or feature flags, the State Demo serves as the primary reference implementation.
