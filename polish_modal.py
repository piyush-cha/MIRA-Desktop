import re

def polish_modal():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix spacing between SPECIFICATION and Noun
    old_spec_label = "<div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0px' }}>\n                  SPECIFICATION\n                </div>"
    new_spec_label = "<div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>\n                  SPECIFICATION\n                </div>"
    content = content.replace(old_spec_label, new_spec_label)

    # 2. Fix Ratification Footer colors so the values stand out
    old_rat_footer = "<div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>\n                  <span>Approving Body: <b>{selectedMaterial.approval_authority}</b></span>\n                  <span>Order Ref: <b>{selectedMaterial.ratification_order}</b></span>\n                </div>"
    
    new_rat_footer = "<div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>\n                  <span>Approving Body: <b style={{ color: 'var(--text-secondary)' }}>{selectedMaterial.approval_authority}</b></span>\n                  <span>Order Ref: <b style={{ color: 'var(--text-secondary)' }}>{selectedMaterial.ratification_order}</b></span>\n                </div>"
    content = content.replace(old_rat_footer, new_rat_footer)

    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Polished modal")

if __name__ == '__main__':
    polish_modal()
