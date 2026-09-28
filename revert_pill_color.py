import re

def revert_pill_color():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    old_pill = "<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(216, 142, 51, 0.1)', border: '1px solid rgba(216, 142, 51, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, color: '#B47622', marginBottom: '2px' }}>"
    new_pill = "<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, color: '#2563eb', marginBottom: '2px' }}>"
    
    if old_pill in content:
        content = content.replace(old_pill, new_pill)
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Reverted MIRA NATIONAL MASTER pill color to blue")
    else:
        print("Could not find exact pill HTML string.")

if __name__ == '__main__':
    revert_pill_color()
