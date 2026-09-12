const basePages = import.meta.glob<{ default: any }>('./base/*/index.tsx', { eager: true });
const customPages = import.meta.glob<{ default: any }>('./custom/*/index.tsx', { eager: true });

const pages: Record<string, any> = {};

// Load base pages
for (const path in basePages) {
    const name = path.match(/\.\/base\/(.+)\/index\.tsx$/)[1];
    pages[name] = basePages[path].default;
}

// Load custom pages (overrides base if same name)
for (const path in customPages) {
    const name = path.match(/\.\/custom\/(.+)\/index\.tsx$/)[1];
    pages[name] = customPages[path].default;
}

export default pages;
