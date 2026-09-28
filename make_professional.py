import re

def make_professional():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update pagination text and color
    content = content.replace('of <b style={{ color: \'#2563EB\' }}>{catalogTotal.toLocaleString()}</b> active records', 
                              'of <b style={{ color: \'#1B2332\' }}>{catalogTotal.toLocaleString()}</b> enterprise records')
    
    # 2. Update search bar styling
    old_search = 'style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\', background: \'var(--bg-canvas, #f8fafc)\', border: \'1px solid var(--border-medium, #cbd5e1)\', borderRadius: \'6px\', padding: \'6px 12px\', width: \'340px\' }}'
    new_search = 'style={{ display: \'flex\', alignItems: \'center\', gap: \'8px\', background: \'#FFFFFF\', border: \'1px solid rgba(27,35,50,0.2)\', borderRadius: \'6px\', padding: \'6px 12px\', width: \'340px\', boxShadow: \'inset 0 1px 2px rgba(0,0,0,0.02)\' }}'
    content = content.replace(old_search, new_search)
    
    with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    make_professional()
    print("Done making professional")
