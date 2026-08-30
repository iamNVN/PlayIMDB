import os
import zipfile
import json

def build_extension():
    # Read version from manifest
    try:
        with open('manifest.json', 'r') as f:
            manifest = json.load(f)
            version = manifest.get('version', '1.0.0')
    except Exception as e:
        print(f"Error reading manifest.json: {e}")
        return

    output_filename = f'PlayIMDb_v{version}.zip'
    
    # Files and folders to exclude from the zip
    exclude_dirs = {'.git', 'scratch', '__pycache__', '.github'}
    exclude_files = {'build.py', 'README.md', output_filename, '.gitignore'}
    
    print(f"Building {output_filename}...")
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Exclude specified directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files or file.endswith('.zip'):
                    continue
                
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)
                print(f"  Added {arcname}")
                
    print(f"\n[SUCCESS] Build complete! Output saved to: {output_filename}")

if __name__ == '__main__':
    build_extension()
