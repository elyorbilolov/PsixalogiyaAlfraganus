import json

def fix_json():
    file_path = 'psix.json'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Mapping of typos/inconsistencies to correct names
        fix_map = {
            "Milliy ttarbiya asoslari": "Milliy tarbiya asoslari",
            "Oila psixologiyasi ": "Oila psixologiyasi",
            "Pedagogika psixologiya ": "Pedagogika psixologiya"
        }
        
        fixed_count = 0
        for item in data:
            original_fan = item.get('Fan_nomi')
            if original_fan in fix_map:
                item['Fan_nomi'] = fix_map[original_fan]
                fixed_count += 1
            elif original_fan and original_fan.endswith(' '):
                item['Fan_nomi'] = original_fan.strip()
                fixed_count += 1
                
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully fixed {fixed_count} entries in {file_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_json()
