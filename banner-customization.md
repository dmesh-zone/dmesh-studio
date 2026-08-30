# Customizing the Global Banner

Data Mesh Studio provides a plugin-based architecture for the global top banner, making it extremely easy to re-brand the application with your organization's logo, user avatars, and product names without modifying the core source code.

## Folder Structure

The banner components are located in `src/banner/`. The folder is divided into `base` (the default Data Mesh Studio implementations) and `custom` (your overrides).

```text
src/
└── banner/
    ├── base/               # Default banner components
    │   ├── Banner.jsx
    │   ├── Logo.jsx
    │   ├── Avatar.jsx
    │   └── ProductName.jsx
    ├── custom/             # Your overrides go here
    │   ├── Logo.jsx        # Example: Your custom logo override
    │   └── ProductName.jsx # Example: Your custom text override
    └── index.jsx           # The registry that dynamically loads overrides
```

## How Overrides Work

The application dynamically discovers all React components placed inside `src/banner/custom/`. If a component in the `custom/` directory has the **exact same filename** as a component in the `base/` directory, your custom component will completely replace the base component across the application.

---

## Example 1: Changing the Product Name

By default, the application displays the word **"Studio"** on the right side of the banner. To change this to something like **"My Org Data Portal"**, simply create a `ProductName.jsx` file in the `custom/` directory.

**Step 1:** Create `src/banner/custom/ProductName.jsx`
**Step 2:** Add your React component:

```javascript
import React from 'react';
import { Typography } from '@mui/material';

export default function ProductName() {
    return (
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            My Org Data Portal
        </Typography>
    );
}
```

The application will automatically detect `custom/ProductName.jsx`, replacing the base "Studio" text with your custom component.

---

## Example 2: Adding a Custom Logo

To replace the Data Mesh logo on the left side of the banner with your own logo, create a `Logo.jsx` override. You can place your image files in the same `custom/` directory or reference them from an external URL or public folder.

**Step 1:** Place your logo file (e.g., `my_logo.png`) in `src/banner/custom/`.
**Step 2:** Create `src/banner/custom/Logo.jsx`.
**Step 3:** Add your React component:

```javascript
import React from 'react';
import myLogo from './my_logo.png';

export default function Logo() {
    return (
        <img 
            src={myLogo} 
            alt="My Organization Logo" 
            style={{ height: '32px', width: 'auto' }} 
        />
    );
}
```

> [!TIP]
> If your organization uses different logos for light and dark modes, you can import the `useThemeContext` hook just like the base component to dynamically switch between them based on the `mode` variable.

---

## Example 3: Customizing the User Avatar

The banner also displays a user avatar. You can override `src/banner/custom/Avatar.jsx` to plug in your organization's authentication context (e.g., MSAL, Okta, or AWS Cognito) to dynamically fetch the logged-in user's profile picture and name.

```javascript
import React from 'react';
import { Box, Typography, Avatar as MuiAvatar } from '@mui/material';
// import { useAuth } from 'your-auth-provider';

export default function Avatar() {
    // const { user } = useAuth();
    const user = { name: "Alice", initial: "A" };
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MuiAvatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.initial}
            </MuiAvatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.name}
            </Typography>
        </Box>
    );
}
```
