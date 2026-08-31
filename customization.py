#!/usr/bin/env python3
import sys
import os
import shutil

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
    custom_sample_data_dir = os.path.join(public_dir, "sampleData", "custom")
    
    if action.lower() == "off":
        # Remove custom config file specifically
        custom_config_path = os.path.join(public_dir, "config", "custom", "config.yaml")
        if os.path.exists(custom_config_path):
            os.remove(custom_config_path)
            
        # Clear custom directories
        clear_directory(custom_themes_dir)
        clear_directory(custom_fonts_dir)
        clear_directory(custom_banner_dir)
        clear_directory(custom_pages_dir)
        clear_directory(custom_sample_data_dir)
        print("Custom config, themes, fonts, banner, pages, and sampleData have been successfully removed (switched OFF)!")
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
        
        # Copy sampleData
        src_sample_data = os.path.join(source_base, "sampleData")
        copy_directory_contents(src_sample_data, custom_sample_data_dir)
        
        print(f"Custom assets from 'dmesh-studio-custom-{action}' have been successfully copied!")

if __name__ == "__main__":
    main()
