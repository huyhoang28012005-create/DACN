import json
import os

files = {
    'vi': 'frontend/src/locales/vi/translation.json',
    'en': 'frontend/src/locales/en/translation.json',
    'ja': 'frontend/src/locales/ja/translation.json'
}

for lang, path in files.items():
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if lang == 'vi':
            data['users'] = "Quản lý người dùng"
            data['users_count'] = "người dùng!"
        elif lang == 'en':
            data['users'] = "User Management"
            data['users_count'] = "users!"
        elif lang == 'ja':
            data['users'] = "ユーザー管理"
            data['users_count'] = "ユーザー！"
            
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated {lang} translation.")
