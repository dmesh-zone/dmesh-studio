# 📓 Release Notes

All notable changes to **DMesh Studio** will be documented in this file.

---

## 🚀 [v0.3.0] - 2026-09-12

### ✨ Highlights
- **TypeScript Migration:** The entire core application, as well as the `dmesh-studio-custom-sample` repository, has been fully migrated from JavaScript (`.jsx`) to TypeScript (`.tsx`). This introduces robust type safety, better developer tooling, and easier long-term maintenance.
- **Modern ESLint:** Fully updated the linting infrastructure to use the modern `eslint.config.js` (flat config) tailored for TypeScript and React.
- **Frontend & Backend Separation:** Reorganized the project layout by splitting the application into distinct `frontend/` (React/Vite) and `backend/` (FastAPI) directories to improve organization and maintainability. Added robust support for overriding and injecting custom backend logic via the peer custom repository mechanism.
- **Frontend State Management:** Unified state, configuration, and authentication under a robust `AppContext`, providing a predictable, centralized store. Added feature flags and custom attributes to user profiles, unlocking dynamically customizable UI flows.
- **Custom Scripts & Plugins:** Introduced a robust headless plugin architecture for lifecycle hooks, as well as support for injecting custom utility scripts.

### 🎨 UI & Dashboard Improvements
- **Component Abstraction:** Introduced highly reusable generic widgets for common UI elements: `DataProductSearchWidget`, `EnvironmentSelectorWidget`, `DomainSelectorWidget`, and `DataProductTypeSelectorWidget`.
- **Layout Consistency:** Unified the layout width and typography (e.g., `<Typography variant="h5">`) of the custom Cost Management Dashboard to perfectly match the core Data Products view.
- **KPI Styling:** Refined the Cost Management Dashboard's KPI cards to dynamically utilize Material UI's primary theme color while respecting the standard background paper color in both light and dark modes.

### 🐛 Bug Fixes & Refinements
- **Environment State Syncing:** Fixed a bug where changing the environment on secondary pages (like Data Products or Cost Management) updated local storage but failed to update the URL. Cross-page environment choices now correctly persist and "stick" across the entire navigation sidebar.
- **Business Name Search Resolution:** Repaired the search filter logic on both the Tabular views and the Dashboard so that queries properly evaluate against the friendly `dataProductBusinessName` instead of just raw internal technical IDs.
- **Observe Mode Toggle:** The 'Observe Mode' observability feature is now securely hidden when the application is not operating in `isTestMode`.
- **Custom Components:** Added support for custom components, demonstrated in the sample project's [Cost Management page](https://github.com/dmesh-zone/dmesh-studio-custom-sample/blob/main/pages/CostManagement/index.tsx).

### 🗃️ State Management & User Profiles
- **Custom Attributes:** Refactored `UserProfile.preferences` to `UserProfile.customAttributes` for broader applicability.
- **Feature Flags:** Introduced `customUserFeatureFlag` functionality in `config.yaml` to dynamically toggle custom UI fields during the login flow.
- **State Demo Revamp:** Cleaned up the State Demo page by removing redundant configuration state panels and demonstrating dynamic user profile mutations using the new feature flags.
- **Documentation:** Added `docs/STATE_MANAGEMENT.md` detailing how `AppContext` unifies user state, config, and authentication.

### 🔌 Headless Lifecycle Plugins
- **Plugin Architecture:** Introduced a new headless plugin system (`AppPlugin`) allowing background logic to hook into application lifecycle events (`onReload` and `onTimer`) completely independently of the React UI tree.
- **Global Notifications:** Added a global event listener system (`show-notification`) tied to a new, persistent Material UI `Snackbar` in the core layout, allowing plugins to dispatch UI toast messages natively.
- **Customization Sync:** Updated the `customization.py` script to automatically synchronize custom plugins into the build process.
- **Documentation:** Created a comprehensive guide for plugins in `docs/PLUGINS.md`.

### 🚀 CI/CD & Deployments
- **Custom Sample Deployments:** Added a dedicated GitHub Actions workflow to the `dmesh-studio-custom-sample` repository, enabling seamless, automated static deployments of customized application builds directly to GitHub Pages.

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