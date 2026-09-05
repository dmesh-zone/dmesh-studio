# dmesh-studio

[![CodeQL](https://github.com/dmesh-zone/dmesh-studio/actions/workflows/codeql.yml/badge.svg)](https://github.com/dmesh-zone/dmesh-studio/actions/workflows/codeql.yml)
[![Snyk Security Scan](https://github.com/dmesh-zone/dmesh-studio/actions/workflows/snyk.yml/badge.svg)](https://github.com/dmesh-zone/dmesh-studio/actions/workflows/snyk.yml)

A React-based visualization tool for exploring Data Mesh dataMeshOperationsList, Data Products, Data Contracts, and Data Usage Agreements.

Live demo: https://dmesh-zone.github.io/dmesh-studio

## Features

- **Interactive Visualization**: Browse Data Products, their relationships, and contracts
- **Domain Filtering**: Filter by domain and search by name
- **Data Quality Rules**: View quality rules and validation criteria
- **Configurable**: Customize icons, colors, and tiers via `config/base/config.yaml`

## Views and Drilldowns
- **DataMesh View**: Default layout displaying all Data Products, Data Contracts, and Data Usage Agreements across domains.
- **Data Product Detail View**: Triggered by clicking the "Ports" (output ports) pill on a Data Product node. This view centers the selected Data Product and displays its direct lineage (upstream producers and downstream consumers).
- **Data Contract View**: Triggered when navigating to a Data Contract, displaying its internal tables, columns, and foreign key relationships.
- **Observe Mode**: Opt-in view overlaying health metrics (Pipeline, Consumption, Freshness, Quality) onto the graph nodes, updating node shading based on status (healthy, warning, critical).
- **YAML Drilldown**: Side panel displaying raw ODCS/ODPS YAML definitions, schema validation results, and allowing line-number mapping for errors (triggered via `open-side-panel`).
- **Observability Drilldown**: Contextual side panel opened by clicking a node in Observe Mode. Shows detailed "Metrics" and "Events" tabs for the selected observability dimension.
- **Details Panel**: Informational side panel providing tabular data, component structure, schemas, and examples for a selected node.

## Configuration

The application is configured through `./public/config/base/config.yaml`. This file controls the default dataMeshOperations URL, visual appearance, and data product tiers.
Additionally, you can create a `./public/config/custom/config/custom/config.yaml` file to override any settings in `config/base/config.yaml` without modifying the default configuration file.

## Customization

DMesh Studio is designed to be easily customized to fit your organization's branding and needs. You can configure themes (light and dark mode), replace logos, map technology icons, and even create completely custom React pages (e.g., custom tabular views for Data Products and Data Sources). 

For a complete guide on overriding styles, assets, components, and pages using the `customization.py` script, please refer to the [Customization Guide](PAGE_CUSTOMISATION.md).


### Configuration File Structure

```yaml
defaultDataMeshOperationalDataUrl: /sampleData/base/DataMeshOperationalData.yaml
theme: light
iconMap:
  ...
tiers:
  ...
```

### Required Fields

#### `defaultDataMeshOperationalDataUrl` (required)

The path or URL to your Data Mesh data mesh operations YAML or JSON file.

**Examples:**
local file: 
```yaml
defaultDataMeshOperationalDataUrl: /sampleData/base/DataMeshOperationalDataPetsMultiEnvExample.yaml
```

remote file:
```yaml
defaultDataMeshOperationalDataUrl: https://www.example.com/sampleData/base/DataMeshOperationalDataPetsMultiEnvExample.yaml
```

### Optional Fields

#### `iconMap` (optional)

Maps technology names to icon file paths. Icons should be placed in `public/icons/`.

**Example:**
```yaml
iconMap:
  databricks: /icons/databricks.svg
  powerBi: /icons/powerbi.svg
  oracle: /icons/oracle.svg
```

**Default**: Empty object (uses fallback icons)

#### `theme` (optional)

Specifies which CSS theme file to load for styling. The value corresponds to a CSS file in the `public/themes/` directory.

**Example:**
```yaml
theme: custom
```

**Default**: `light`

#### `tiers` (optional)

Defines positioning and labels for Data Product tiers. Visual styling (like colors) is managed via CSS themes.

**Example:**
```yaml
tiers:
  sourceAligned:
    label: DATA PRODUCT (SOURCE ALIGNED)
    columnNumber: 1
```

**Properties:**
- `label`: Display text for the tier banner
- `columnNumber`: Column position (1, 2, 3, 4, 5...) for auto-layout. Spacing is automatically calculated at 450px per column. All nodes in a column have a consistent width of 280px.

**Default**: Includes `dataSource`, `sourceAligned`, `curated`, `consumerAligned`, and `application` tiers

### Customization

You can fully customize the studio's themes, fonts, banners, components, and configurations without permanently altering the core codebase by maintaining a separate, peer repository.

A sample customization repository is available at [dmesh-studio-custom-sample](https://github.com/dmesh-zone/dmesh-studio-custom-sample).

This repository illustrates how to customise:
- Banner, including logo and product name
- Config, including navigation drawer items, environments supported, etc.
- Fonts
- Themes, allowing definition of colors and style for both light and dark themes
- Pages, allowing adding or overriding navigational drawer target pages 

To apply customizations using this approach:
1. Clone the customization repository into the same parent directory as your `dmesh-studio` project:
   ```bash
   git clone git@github.com:dmesh-zone/dmesh-studio-custom-sample.git
   ```
2. Navigate into your `dmesh-studio` directory and run the `customization.py` script, passing the suffix of your custom repository (e.g., `sample`):
   ```bash
   python3 customization.py sample
   ```
   This script will automatically locate the sibling `dmesh-studio-custom-sample` directory and seamlessly copy its `config`, `themes`, `fonts`, `banner`, and `pages` assets into the active `custom/` directories within `dmesh-studio`.

3. To remove all custom assets and revert to the base `dmesh-studio` experience, run:
   ```bash
   python3 customization.py off
   ```

## Local Development

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher

### Installation
Clone or download the repository and then install dependencies

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or the next available port).

### Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Observability Simulation

A standalone simulation module is available to generate realistic observability metrics for testing.

### Runtime Simulation

When running the application in test mode (append `#test` to the URL), you can enable real-time metric simulation from the **Observability Settings (cog icon)** sub-menu. This will generate metrics for:
- Pipeline Status
- SLOs
- Freshness
- Quality

Simulated health follows a distribution of 70% Healthy, 20% Degraded, and 10% Critical.

### CLI Simulation

You can use the simulation module to generate metrics for a data mesh operations file from the command line:

```bash
# Generate simulated metrics for all dimensions
node src/ObsSimulation.js public/MyData Mesh Operations.yaml

# Generate specific dimensions
node src/ObsSimulation.js public/MyData Mesh Operations.yaml Pipeline,SLOs
```

This will create a new file `public/MyData Mesh Operations-with-sim-metrics.yaml` containing the original data plus the simulated observability metrics.

## Troubleshooting

### Configuration Errors

If you see a red "Configuration Error" banner:

**"Failed to load config/base/config.yaml"**
- Ensure `public/config/base/config.yaml` exists
- Check that the file is valid YAML (proper indentation, no tabs)
- Verify file permissions

**"config/base/config.yaml is empty"**
- Add configuration settings to the file
- See the Configuration section above for the required structure

**"config/base/config.yaml contains invalid YAML syntax"**
- Check indentation (use spaces, not tabs)
- Ensure colons have spaces after them
- Validate your YAML using an online validator

**"config/base/config.yaml is missing required field 'defaultDataMeshOperationalDataUrl'"**
- Add the `defaultDataMeshOperationalDataUrl` field to your config/base/config.yaml
- Example: `defaultDataMeshOperationalDataUrl: /sampleData/base/DataMeshOperationalData.yaml`

**"config/base/config.yaml must contain a valid YAML document"**
- Ensure the file is not empty
- Check that the file contains valid YAML structure
- Use a YAML validator to check syntax

### Data Mesh Operations Loading Errors

**"Failed to fetch dataMeshOperations"**
- Verify the dataMeshOperations URL in `defaultDataMeshOperationalDataUrl` is correct
- Ensure the data mesh operations file exists at the specified path
- Check browser console for CORS errors if loading from external URL

**"Invalid YAML format"**
- Validate your data mesh operations YAML file
- Ensure proper indentation (use spaces, not tabs)
- Check for syntax errors in the YAML

### No Data Products Displayed

- Check that domains are selected in the Domain Selector dropdown
- Verify your dataMeshOperations contains Data Products with `kind: DataProduct`
- Use the global filter to search for specific products

### Icons Not Displaying

- Ensure icon files exist in `public/icons/`
- Verify paths in `iconMap` start with `/icons/`
- Check that icon file names match exactly (case-sensitive)

## Data Mesh Operations File Format

The application expects a YAML file containing an array of Data Mesh entries that must conform with one of the following standards and specifications:
* [Open Data Product Standard](https://bitol-io.github.io/open-data-product-standard/v1.0.0)
* [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/v3.0.1) 
* [Data Usage Agreement specification](https://datausageagreement.com/)

**Supported Entity Types:**
- `DataProduct`: Data products with metadata, output ports, and contracts
- `DataContract`: Schema definitions with columns, types, and relationships
- `DataUsageAgreement`: Agreements between providers and consumers

See the included `public/DataMeshPetsData Mesh Operations.yaml` for a complete example.

## Browser Compatibility

- Chrome/Edge: Version 90+
- Firefox: Version 88+
- Safari: Version 14+

## License

Copyright 2026 Joao Vicente

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) file for details.
