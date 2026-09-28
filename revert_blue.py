import re

def revert_sidebar_to_blue():
    with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # MIRA ENTERPRISE text (currently #475569)
    content = content.replace('color: \'#475569\'', 'color: \'#2563eb\'')
    
    # ENTERPRISE SILO
    content = content.replace('rgba(224, 152, 60, 0.1)', 'rgba(37, 99, 235, 0.08)') # Background
    content = content.replace('rgba(224, 152, 60, 0.3)', 'rgba(37, 99, 235, 0.22)') # Border
    content = content.replace('color=\"#E0983C\"', 'color=\"#2563eb\"') # Lock icon
    content = content.replace('color: \'#1e293b\'', 'color: \'#1e40af\'') # Select text
    
    with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def revert_css_to_blue():
    with open('src/index.css', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Profile designation badge
    content = content.replace('color: #1B2332;', 'color: #1D4ED8;')
    content = content.replace('background: #D88E33;', 'background: #EFF6FF;')
    content = content.replace('border: 1px solid rgba(27,35,50,0.2);', 'border: 1px solid #BFDBFE;')
    
    # Avatar background (was #1B2332, we just blindly replaced #3b82f6 with #1B2332 earlier.
    # To be safe, let's explicitly find the profile-avatar background)
    content = re.sub(r'(\.profile-avatar\s*\{.*?background-color:\s*)#1B2332(.*?})', r'\1#3b82f6\2', content, flags=re.DOTALL)
    # also handle if it was `background:` instead of `background-color:`
    content = re.sub(r'(\.profile-avatar\s*\{.*?background:\s*)#1B2332(.*?})', r'\1#3b82f6\2', content, flags=re.DOTALL)
    content = re.sub(r'(\.sidebar-avatar\s*\{.*?background:\s*)#1B2332(.*?})', r'\1#3b82f6\2', content, flags=re.DOTALL)
    
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    revert_sidebar_to_blue()
    revert_css_to_blue()
    print("Done reverting to blue")
