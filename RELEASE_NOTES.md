# 📓 Release Notes

All notable changes to **DMesh Studio** will be documented in this file.

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