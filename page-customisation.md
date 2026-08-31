# Customising Navigation and Pages

Data Mesh Studio is designed to be highly extensible. You can customize the pages available in the application, override existing base pages, and completely control the items that appear in the navigation drawer (including their icons and groupings).

## Folder Structure

The application's pages are organized to separate the core "base" functionality from your organization's "custom" overrides.

```text
src/
├── pages/
│   ├── base/               # Core pages shipped with Data Mesh Studio
│   │   ├── DataMesh/
│   │   ├── DataProducts/
│   │   └── Settings/
│   ├── custom/             # Your organization's custom pages
│   │   ├── About/          # Example: A brand new page
│   │   └── DataProducts/   # Example: Overriding the base DataProducts page
│   └── index.js            # Page registry that merges base and custom pages
```

### Overriding a Base Page
To override an existing page (like `DataProducts`), simply create a folder with the exact same name inside `src/pages/custom/`. The application's page registry will automatically prioritize your custom page over the base page.

### Creating a New Page
To create a completely new page, you need to add a React component in the `src/pages/custom/` directory and then reference it in your configuration. Here is a step-by-step guide:

**Step 1: Create the Page Directory and Component**
Create a new folder for your page inside `src/pages/custom/`, for example `src/pages/custom/About/`. Inside that folder, create an `index.jsx` file with your React component.

Example `src/pages/custom/About/index.jsx`:
```javascript
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function About() {
    return (
        <Box sx={{ p: 4, height: '100%', overflow: 'auto', bgcolor: 'var(--m3-surface, #f5f5f5)' }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                About Data Mesh Studio
            </Typography>
            <Typography variant="body1">
                This is a custom page added via the plugin architecture!
            </Typography>
        </Box>
    );
}
```

**Step 2: Add to Navigation Configuration**
Open your `public/config/custom/config/base/config.yaml` (or `config/base/config.yaml`) and add your new page to a navigation section. Make sure the `component` matches the folder name you created in Step 1.

```yaml
    - name: "Other views"
      pages:
        - id: "about"
          title: "About"
          icon: "Assessment"
          component: "About" # This matches src/pages/custom/About
```

That's it! The application will automatically discover your component and render it when the navigation item is clicked.

---

## Configuring the Navigation Drawer

The navigation drawer is driven entirely by configuration. You can modify `public/config/custom/config/base/config.yaml` to define which pages show up, how they are grouped into sections, and what icons they use.

### `config/custom/config.yaml` Example

```yaml
navigation:
  sections:
    - name: "Core Views"
      pages:
        - id: "mesh"
          title: "Data Mesh"
          icon: "Hub" # Uses Material-UI HubIcon
          component: "DataMesh" # Maps to the folder name in src/pages/base
          
        - id: "products"
          title: "Data Products"
          icon: "Layers" # Uses Material-UI LayersIcon
          component: "DataProducts" # Maps to the folder name in src/pages/custom
          
    - name: "Preferences"
      pages:
        - id: "settings"
          title: "Settings"
          icon: "Settings"
          component: "Settings"

    - name: "Other views"
      pages:
        - id: "about"
          title: "About"
          icon: "Assessment" # Uses Material-UI AssessmentIcon
          component: "About" # Maps to src/pages/custom/About
```

### Configuration Properties

For each page in the `navigation` block:
- **`id`**: A unique identifier for the route/view state.
- **`title`**: The text that appears in the navigation drawer and tooltips.
- **`icon`**: The name of the Material-UI icon to display (e.g., "Hub" renders `<HubIcon />`).
- **`component`**: The registered component name (matching the folder name in `src/pages/base` or `src/pages/custom`).

By modifying `config/custom/config.yaml`, your organization can add new navigation items or hide existing ones without modifying the React source code.
