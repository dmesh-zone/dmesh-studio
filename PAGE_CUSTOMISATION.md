# Customising Navigation and Pages

DMesh Studio is designed to be highly extensible. You can customize the pages available in the application, override existing base pages, and completely control the items that appear in the navigation drawer (including their icons and groupings).

## Folder Structure

The application's pages are organized to separate the core "base" functionality from your organization's "custom" overrides.

```text
src/
├── pages/
│   ├── base/               # Core pages shipped with DMesh Studio
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
                About DMesh Studio
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

---

## Creating Pages with DataProductTabular

For creating rich tabular views of Data Products (like the Data Products or Data Sources pages), DMesh Studio provides a powerful shared component called `DataProductTabular`. By passing configuration objects, you can automatically generate interactive tables and side panels without writing complex rendering logic.

### 1. The Component Structure

To use it, import `DataProductTabular` and provide the required descriptors:

```javascript
import React from 'react';
import DataProductTabular from '../../../components/DataProductTabular';

export default function MyCustomPage() {
    const tableDescriptor = [ /* Column definitions */ ];
    const sidePanelDescriptor = [ /* Side panel field definitions */ ];

    return (
        <DataProductTabular
            title="My Custom View"
            tierFilter={['sourceAligned', 'curated', 'consumerAligned']}
            tableDescriptor={tableDescriptor}
            sidePanelDescriptor={sidePanelDescriptor}
            renderAboveTable={({ sortedProducts }) => {
                // Render custom summary cards or metrics here!
                return <div>Total Products: {sortedProducts.length}</div>;
            }}
        />
    );
}
```

### 2. Extracting ODPS Values

The `odpsDescriptor` field tells the table which property to extract from the Open Data Product Specification (ODPS) YAML. It supports dot-notation for nested fields.

```javascript
// Extracts the top-level "domain" property
{ columnName: "Domain", odpsDescriptor: "domain" }

// Extracts nested properties
{ columnName: "Purpose", odpsDescriptor: "description.purpose" }
```

### 3. Text Conversions and Context (`ctx`)

Sometimes raw ODPS values need to be mapped to human-readable names or enriched. You can use the `textMapper` function, which receives the raw value and a `ctx` (context) object containing helper functions.

The `ctx` object provides built-in formatters:
- `ctx.formatDomain(val)`: Looks up the domain's human-readable name from config.
- `ctx.formatType(val)`: Looks up the data product tier/type name.
- `ctx.formatTechnology(val)`: Looks up technology names and resolves icons.

```javascript
{ 
    columnName: "Domain", 
    odpsDescriptor: "domain", 
    textMapper: (val, ctx) => ctx.formatDomain(val) 
}
```

### 4. Special and Pseudo-Properties

DMesh Studio provides helper functions to extract data that isn't a simple top-level property:

- **Custom Properties**: Use `_customProperty("propertyName")` to safely extract values from the `customProperties` array in the ODPS document.
- **Highest Environment**: Use the pseudo-property `_highestEnv` to automatically calculate the highest deployed environment (e.g., Prod > QA > Dev) based on the Data Product's output ports.

```javascript
{ 
    columnName: "Type", 
    odpsDescriptor: "_customProperty(\"dataProductTier\")",
    textMapper: (val, ctx) => ctx.formatType(val)
},
{ 
    columnName: "Stage", 
    odpsDescriptor: "_highestEnv"
}
```

### 5. Display Formats and Interactions

You can control how the extracted text is rendered in the table UI:

- **Chips**: Set `displayFormat: "chip"` to render the value inside a rounded Material-UI Chip component (useful for environments or statuses).
- **Side Panel Links**: Set `sidePanelLink: true` to render the text as a clickable hyperlink. When clicked, it will slide open the Details Panel showing the fields defined in your `sidePanelDescriptor`.

```javascript
{ 
    columnName: "Data Product Name", 
    odpsDescriptor: "name", 
    sidePanelLink: true 
},
{ 
    columnName: "Stage", 
    odpsDescriptor: "_highestEnv", 
    displayFormat: "chip" 
}
```

### 6. Iterating through Data Products (`renderAboveTable`)

The `DataProductTabular` component handles all global searching, domain filtering, and pagination for you. It exposes the filtered list of products via the `renderAboveTable` render prop. You can iterate through `sortedProducts` to build dynamic metric cards or charts that instantly update when the user changes filters.

```javascript
renderAboveTable={({ sortedProducts }) => {
    const curated = sortedProducts.filter(p => p.type === 'curated').length;
    
    return (
        <div className="metrics-row">
            <MetricCard label="Curated" count={curated} />
        </div>
    );
}}
```

### 7. Defining Side Panel Attributes

When `sidePanelLink: true` is enabled on a table column, clicking the cell opens a side panel that displays detailed attributes of the selected Data Product. The contents of this side panel are defined using the `sidePanelDescriptor` array.

Each object in `sidePanelDescriptor` maps an ODPS property to a human-readable field name in the side panel. It uses the exact same `odpsDescriptor` dot-notation rules as the main table.

```javascript
const sidePanelDescriptor = [
    { name: "ID", odpsDescriptor: "id" },
    { name: "DOMAIN TECHNICAL NAME", odpsDescriptor: "domain" },
    { name: "DATA PRODUCT TECHNICAL NAME", odpsDescriptor: "name" },
    { name: "PURPOSE", odpsDescriptor: "description.purpose" }
];
```

You pass this descriptor array directly to the component:

```javascript
<DataProductTabular
    // ...
    sidePanelDescriptor={sidePanelDescriptor}
/>
```
