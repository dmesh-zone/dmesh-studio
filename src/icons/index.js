import * as MuiIcons from '@mui/icons-material';

// Automatically load all .jsx files in the custom folder
const customIcons = import.meta.glob('./custom/*.jsx', { eager: true });
const customRegistry = {};

for (const path in customIcons) {
    const name = path.match(/\.\/custom\/(.+)\.jsx$/)[1];
    customRegistry[name] = customIcons[path].default;
}

/**
 * Resolves an icon by name. 
 * Prioritizes custom icons over MUI defaults.
 */
export const getIcon = (iconName) => {
    return customRegistry[iconName] 
        || customRegistry[iconName + 'Icon']
        || MuiIcons[iconName] 
        || MuiIcons[iconName + 'Icon'] 
        || MuiIcons.Layers;
};
