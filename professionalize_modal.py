import re

def professionalize_modal():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix Modal Header
    old_header_bg = "background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfdf5 100%)'"
    new_header_bg = "background: 'var(--bg-card)'"
    content = content.replace(old_header_bg, new_header_bg)

    old_header_text = "<div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#065f46' }}>\n                  <ShieldCheck size={14} color=\"#059669\" />\n                  GOVERNMENT RATIFIED SPECIFICATION POINTER\n                </div>"
    new_header_text = "<div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>\n                  <ShieldCheck size={14} />\n                  SPECIFICATION DETAILS\n                </div>"
    content = content.replace(old_header_text, new_header_text)

    # 2. Fix What is this material
    old_what_box = "background: 'var(--bg-app)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)'"
    new_what_box = "padding: '0 0 16px 0', borderBottom: '1px solid var(--border-light)'"
    content = content.replace(old_what_box, new_what_box)

    old_what_title = "WHAT IS THIS MATERIAL? (CORE SPECIFICATION)"
    new_what_title = "SPECIFICATION"
    content = content.replace(old_what_title, new_what_title)

    # 3. Fix Ratification Basis
    old_rat_box = "background: '#fffbeb', padding: '16px', borderRadius: '10px', border: '1px solid #fde68a'"
    new_rat_box = "background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)'"
    content = content.replace(old_rat_box, new_rat_box)

    old_rat_title = "<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 800, color: '#92400e', marginBottom: '2px' }}>\n                  <Award size={15} color=\"#d97706\" />\n                  RATIFICATION BASIS:\n                </div>"
    new_rat_title = "<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>\n                  <Award size={14} />\n                  RATIFICATION BASIS:\n                </div>"
    content = content.replace(old_rat_title, new_rat_title)
    
    # Ratification text styles
    content = content.replace("color: '#78350f'", "color: 'var(--text-secondary)'")
    content = content.replace("color: '#b45309'", "color: 'var(--text-muted)'")
    content = content.replace("borderTop: '1px solid #fef3c7'", "borderTop: '1px solid var(--border-light)'")

    # 4. Fix CPSE Linked text
    old_cpse_title = "<div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>\n                    <LinkIcon size={14} color=\"#2563eb\" />\n                    SAME PHYSICAL MATERIAL LINKED ACROSS CPSEs ({selectedMaterial.mapped_cpses.length} ENTERPRISES):\n                  </div>"
    new_cpse_title = "<div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>\n                    <LinkIcon size={14} />\n                    LINKED CPSEs ({selectedMaterial.mapped_cpses.length}):\n                  </div>"
    content = content.replace(old_cpse_title, new_cpse_title)

    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Professionalized modal")

if __name__ == '__main__':
    professionalize_modal()
