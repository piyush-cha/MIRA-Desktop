import re

def fix_sidebar():
    with open('src/components/layout/Sidebar.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('rgba(37,99,235,0.08)', 'rgba(255,255,255,0.05)')
    content = content.replace('rgba(37, 99, 235, 0.08)', 'rgba(255,255,255,0.05)')
    content = content.replace('color: \'#2563eb\'', 'color: \'#94a3b8\'')
    content = content.replace('rgba(37,99,235,0.22)', 'rgba(255,255,255,0.1)')
    content = content.replace('rgba(37, 99, 235, 0.22)', 'rgba(255,255,255,0.1)')
    content = content.replace('color="#2563eb"', 'color="#94a3b8"')
    content = content.replace('color: \'#1e40af\'', 'color: \'#cbd5e1\'')
    
    with open('src/components/layout/Sidebar.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_css():
    with open('src/index.css', 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace('color: #1D4ED8;', 'color: #1B2332;')
    content = content.replace('background: #EFF6FF;', 'background: #D88E33;')
    content = content.replace('border: 1px solid #BFDBFE;', 'border: 1px solid rgba(27,35,50,0.2);')
    content = content.replace('background: #3b82f6;', 'background: #1B2332;')
    
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_sidebar()
    fix_css()
    print("Done")
