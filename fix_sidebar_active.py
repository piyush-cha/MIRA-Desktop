import re

def fix_sidebar_active():
    with open('src/index.css', 'r', encoding='utf-8') as f:
        content = f.read()

    old_active = ".nav-item.active { background: var(--bg-hover); color: var(--accent-dark); font-weight: 600; }"
    new_active = ".nav-item.active { background: rgba(37, 99, 235, 0.1); color: #2563eb; font-weight: 700; border-right: 3px solid #2563eb; }"
    
    if old_active in content:
        content = content.replace(old_active, new_active)
        with open('src/index.css', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Updated active state styling")
    else:
        print("Could not find the exact string. Using regex...")
        content = re.sub(r'\.nav-item\.active\s*\{[^}]*\}', new_active, content)
        with open('src/index.css', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Updated using regex")

if __name__ == '__main__':
    fix_sidebar_active()
