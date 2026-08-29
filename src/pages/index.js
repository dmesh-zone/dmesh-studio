const basePages = import.meta.glob('./base/*/index.jsx', { eager: true });
const customPages = import.meta.glob('./custom/*/index.jsx', { eager: true });

const pages = {};

// Load base pages
for (const path in basePages) {
    const name = path.match(/\.\/base\/(.+)\/index\.jsx$/)[1];
    pages[name] = basePages[path].default;
}

// Load custom pages (overrides base if same name)
for (const path in customPages) {
    const name = path.match(/\.\/custom\/(.+)\/index\.jsx$/)[1];
    pages[name] = customPages[path].default;
}

export default pages;
