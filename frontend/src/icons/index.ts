import * as MuiIcons from '@mui/icons-material';

// Automatically load all .tsx files in the custom folder
const customIcons = import.meta.glob<{ default: any }>('./custom/*.tsx', { eager: true });
const customRegistry: Record<string, any> = {};

for (const path in customIcons) {
    const name = path.match(/\.\/custom\/(.+)\.tsx$/)[1];
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
