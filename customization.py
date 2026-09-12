#!/usr/bin/env python3
import sys
import os
import shutil
import json
import subprocess

def clear_directory(path):
    if not os.path.exists(path):
        return
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isfile(item_path):
            os.remove(item_path)
        elif os.path.isdir(item_path):
            shutil.rmtree(item_path)

def copy_directory_contents(src, dest):
    if not os.path.exists(src):
        return
    os.makedirs(dest, exist_ok=True)
    for item in os.listdir(src):
        src_path = os.path.join(src, item)
        dest_path = os.path.join(dest, item)
        if os.path.isdir(src_path):
            if os.path.exists(dest_path):
                shutil.rmtree(dest_path)
            shutil.copytree(src_path, dest_path)
        else:
            shutil.copy2(src_path, dest_path)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 customization.py <input>")
        print("       <input> can be 'off' or a custom name (e.g., 'acme')")
        sys.exit(1)
        
    action = sys.argv[1]
    
    # Define destination directories relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, "public")
    custom_themes_dir = os.path.join(public_dir, "themes", "custom")
    custom_fonts_dir = os.path.join(public_dir, "fonts", "custom")
    custom_banner_dir = os.path.join(script_dir, "src", "banner", "custom")
    custom_pages_dir = os.path.join(script_dir, "src", "pages", "custom")
    custom_icons_dir = os.path.join(script_dir, "src", "icons", "custom")
    custom_components_dir = os.path.join(script_dir, "src", "components", "custom")
    custom_sample_data_dir = os.path.join(public_dir, "sampleData", "custom")
    
    if action.lower() == "off":
        # Remove custom config file specifically
        custom_config_path = os.path.join(public_dir, "config", "custom", "config.yaml")
        if os.path.exists(custom_config_path):
            os.remove(custom_config_path)
            
        # Remove custom dependencies
        custom_deps_path = os.path.join(custom_pages_dir, "custom_dependencies.json")
        if os.path.exists(custom_deps_path):
            try:
                with open(custom_deps_path, 'r') as f:
                    deps = json.load(f)
                if deps:
                    print(f"Uninstalling custom dependencies: {', '.join(deps)}")
                    subprocess.run(["npm", "uninstall"] + deps, cwd=script_dir, check=True)
            except Exception as e:
                print(f"Warning: Failed to uninstall custom dependencies: {e}")
            os.remove(custom_deps_path)
            
        # Clear custom directories
        clear_directory(custom_themes_dir)
        clear_directory(custom_fonts_dir)
        clear_directory(custom_banner_dir)
        clear_directory(custom_pages_dir)
        clear_directory(custom_components_dir)
        clear_directory(custom_icons_dir)
        clear_directory(custom_sample_data_dir)
        print("Custom config, themes, fonts, banner, pages, components, icons, and sampleData have been successfully removed (switched OFF)!")
    else:
        # Action is an input name, find dmesh-studio-custom-<input>
        source_base = os.path.join(script_dir, "..", f"dmesh-studio-custom-{action}")
        source_base = os.path.abspath(source_base)
        
        if not os.path.exists(source_base):
            print(f"Error: Source directory '{source_base}' not found.")
            sys.exit(1)
            
        # Copy config
        src_config = os.path.join(source_base, "config")
        custom_config_dir = os.path.join(public_dir, "config", "custom")
        copy_directory_contents(src_config, custom_config_dir)
        
        # Copy themes
        src_themes = os.path.join(source_base, "themes")
        copy_directory_contents(src_themes, custom_themes_dir)
        
        # Copy fonts
        src_fonts = os.path.join(source_base, "fonts")
        copy_directory_contents(src_fonts, custom_fonts_dir)
        
        # Copy banner
        src_banner = os.path.join(source_base, "banner")
        copy_directory_contents(src_banner, custom_banner_dir)
        
        # Copy pages
        src_pages = os.path.join(source_base, "pages")
        copy_directory_contents(src_pages, custom_pages_dir)
        
        # Copy icons
        src_icons = os.path.join(source_base, "icons")
        copy_directory_contents(src_icons, custom_icons_dir)
        
        # Copy components
        src_components = os.path.join(source_base, "components")
        copy_directory_contents(src_components, custom_components_dir)
        
        # Copy sampleData
        src_sample_data = os.path.join(source_base, "sampleData")
        copy_directory_contents(src_sample_data, custom_sample_data_dir)
        
        # Handle dependencies
        deps_path = os.path.join(source_base, "dependencies.json")
        if os.path.exists(deps_path):
            try:
                with open(deps_path, 'r') as f:
                    deps_data = json.load(f)
                deps = deps_data.get("dependencies", {})
                if deps:
                    install_args = [f"{pkg}@{ver}" for pkg, ver in deps.items()]
                    print(f"Installing custom dependencies: {', '.join(install_args)}")
                    subprocess.run(["npm", "install"] + install_args, cwd=script_dir, check=True)
                    
                    # Save tracker file
                    custom_deps_path = os.path.join(custom_pages_dir, "custom_dependencies.json")
                    os.makedirs(custom_pages_dir, exist_ok=True)
                    with open(custom_deps_path, 'w') as f:
                        json.dump(list(deps.keys()), f)
            except Exception as e:
                print(f"Warning: Failed to install custom dependencies: {e}")
        
        print(f"Custom assets from 'dmesh-studio-custom-{action}' have been successfully copied!")

if __name__ == "__main__":
    main()
