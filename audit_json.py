import json

try:
    with open('psix.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    subjects = {}
    for item in data:
        fan = item.get('Fan_nomi', 'Unknown')
        subjects[fan] = subjects.get(fan, 0) + 1
    
    print("Subjects in psix.json:")
    for fan, count in subjects.items():
        print(f"- {fan}: {count} questions")
        
except Exception as e:
    print(f"Error: {e}")
