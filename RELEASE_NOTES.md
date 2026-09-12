# 📓 Release Notes

All notable changes to **DMesh Studio** will be documented in this file.

---

## 🚀 [v0.3.0] - 2026-09-12

### ✨ Highlights
- **TypeScript Migration:** The entire core application, as well as the `dmesh-studio-custom-sample` repository, has been fully migrated from JavaScript (`.jsx`) to TypeScript (`.tsx`). This introduces robust type safety, better developer tooling, and easier long-term maintenance.
- **Modern ESLint:** Fully updated the linting infrastructure to use the modern `eslint.config.js` (flat config) tailored for TypeScript and React.
- **Monorepo Restructuring:** Reorganized the project layout by splitting the application into distinct `frontend/` (React/Vite) and `backend/` (FastAPI) directories to improve organization and maintainability, while fully preserving compatibility with automated Databricks App deployments.

### 🎨 UI & Dashboard Improvements
- **Component Abstraction:** Introduced highly reusable generic widgets for common UI elements: `DataProductSearchWidget`, `EnvironmentSelectorWidget`, `DomainSelectorWidget`, and `DataProductTypeSelectorWidget`.
- **Layout Consistency:** Unified the layout width and typography (e.g., `<Typography variant="h5">`) of the custom Cost Management Dashboard to perfectly match the core Data Products view.
- **KPI Styling:** Refined the Cost Management Dashboard's KPI cards to dynamically utilize Material UI's primary theme color while respecting the standard background paper color in both light and dark modes.

### 🐛 Bug Fixes & Refinements
- **Environment State Syncing:** Fixed a bug where changing the environment on secondary pages (like Data Products or Cost Management) updated local storage but failed to update the URL. Cross-page environment choices now correctly persist and "stick" across the entire navigation sidebar.
- **Business Name Search Resolution:** Repaired the search filter logic on both the Tabular views and the Dashboard so that queries properly evaluate against the friendly `dataProductBusinessName` instead of just raw internal technical IDs.
- **Observe Mode Toggle:** The 'Observe Mode' observability feature is now securely hidden when the application is not operating in `isTestMode`.
- **Data Integrity:** Resolved mismatched environment string mappings (e.g., "data store" vs "data source") across `MultiEnvSampleOperationalData.yaml` and the sample Cost CSV files, fixing an issue where dashboard costs were rendering as $0.

---

## 🚀 [v0.2.0] - 2026-09-11

### 🎨 Customization & Extensibility
- **Custom NPM Dependencies:** Added support for `dependencies.json` in peer custom repositories (see [CUSTOM_DEPENDENCIES.md](docs/CUSTOM_DEPENDENCIES.md)). The `customization.py` script now automatically injects and cleans up third-party libraries during the build process.
- **Custom SVG Icons:** Introduced an icon registry (`src/icons/`) powered by Vite. Custom `.jsx` SVGs can now cleanly override default Material UI navigational icons (see [dmesh-studio-custom-sample/icons/CustomMeshIcon.jsx](https://github.com/dmesh-zone/dmesh-studio-custom-sample/blob/main/icons/CustomMeshIcon.jsx) for an example).


### 📚 Documentation
- Consolidated customization documentation into a new `docs/` directory ([CUSTOM_PAGES.md](docs/CUSTOM_PAGES.md), [CUSTOM_DEPENDENCIES.md](docs/CUSTOM_DEPENDENCIES.md), [DATABRICKS_APP_DEPLOYMENT.md](docs/DATABRICKS_APP_DEPLOYMENT.md)).

---

## 🚀 [v0.1.0] - 2026-09-05

### ✨ Highlights
Initial release of DMesh Studio, which is an evolution from [DMesh Viewer](https://github.com/dmesh-zone/dmesh-viewer)

### 🎨 UI & Theming
- Introduced multi-environment UI customization (see [dmesh-studio-custom-sample](https://github.com/dmesh-zone/dmesh-studio-custom-sample)).
- Implemented declarative tabular views and side panels for Data Products and Data Sources.
- Enhanced global styling via unified ThemeContext.

### ⚙️ Core Logic & Routing
- **Deep Linking & Routing:** Fully migrated application state to URL-based routing using `react-router-dom`, enabling direct deep-linking into specific Data Products, Data Sources, and Environments.
- **Data-Driven Views:** Modularized Operational Data to allow `DataProductTabular` child pages to inherit configurations declaratively (see [CUSTOM_PAGES.md](docs/CUSTOM_PAGES.md) ).
- Dynamic asset loading based on environment configurations.
- Custom node types and edge pathing in React Flow visualization.