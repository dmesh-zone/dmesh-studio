import React from 'react';

const baseComponents = import.meta.glob('./base/*.jsx', { eager: true });
const customComponents = import.meta.glob('./custom/*.jsx', { eager: true });

const components = {};

// Load base components
for (const path in baseComponents) {
    const name = path.match(/\.\/base\/(.+)\.jsx$/)[1];
    components[name] = baseComponents[path].default;
}

// Load custom components (overrides base if same name)
for (const path in customComponents) {
    const name = path.match(/\.\/custom\/(.+)\.jsx$/)[1];
    components[name] = customComponents[path].default;
}

export const Logo = components.Logo;
export const Avatar = components.Avatar;
export const ProductName = components.ProductName;
const BannerLayout = components.Banner;

export default function Banner() {
    return (
        <BannerLayout 
            LogoComponent={Logo} 
            AvatarComponent={Avatar}
            ProductNameComponent={ProductName} 
        />
    );
}
