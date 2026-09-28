import re

def fix_sidebar_light():
    with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # MIRA ENTERPRISE text
    content = content.replace('color: \'#94a3b8\'', 'color: \'#475569\'')
    
    # ENTERPRISE SILO
    content = content.replace('rgba(255,255,255,0.05)', 'rgba(224, 152, 60, 0.1)') # Background
    content = content.replace('rgba(255,255,255,0.1)', 'rgba(224, 152, 60, 0.3)') # Border
    content = content.replace('color=\"#94a3b8\"', 'color=\"#E0983C\"') # Lock icon
    content = content.replace('color: \'#cbd5e1\'', 'color: \'#1e293b\'') # Select text
    
    with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_css_light():
    with open('src/index.css', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # Remove the .sidebar !important overrides from the end
    # They look like:
    # .sidebar { background-color: #1B2332 !important; border-right: 1px solid #2A3649 !important; }
    
    new_lines = []
    for line in lines:
        if '.sidebar { background-color: #1B2332 !important' in line:
            continue
        if '.sidebar-logo-text { color: #F8FAFC !important;' in line:
            continue
        if '.sidebar .nav-section-title { color: #64748B !important;' in line:
            continue
        if '.sidebar .nav-item { color: #94A3B8 !important;' in line:
            continue
        if '.sidebar .nav-item:hover { background-color: #2A3649 !important' in line:
            continue
        if '.sidebar .nav-item.active { background-color: rgba(224, 152, 60, 0.15) !important' in line:
            continue
        if '.sidebar .sidebar-profile-row { border-top: 1px solid #2A3649 !important;' in line:
            continue
        if '.sidebar .profile-name { color: #F8FAFC !important;' in line:
            continue
        if '.sidebar .profile-role-meta { color: #E0983C !important;' in line:
            continue
        if '.sidebar .sidebar-search input { background-color: #0F1520 !important' in line:
            continue
        if '.sidebar .sidebar-search input::placeholder { color: #64748B !important;' in line:
            continue
        if '.sidebar .sidebar-search svg { color: #64748B !important;' in line:
            continue
        
        new_lines.append(line)
        
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == '__main__':
    fix_sidebar_light()
    fix_css_light()
    print("Done")
