import re

def fix_table_badges():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Shorten PENDING_NATIONAL_MINT to MINT PENDING
    content = content.replace('{item.cnmc_code}', '{item.cnmc_code === \'PENDING_NATIONAL_MINT\' ? \'MINT PENDING\' : item.cnmc_code}')
    
    # 2. Update status-pill styling to be neutral/gold instead of bright green/amber
    # Lines 1902-1936
    # Let's replace the whole style block for the cnmc_code
    old_style = """                          style={item.duplicate_risk === 'PENDING_APPROVAL' ? {
                            background: '#fef3c7',
                            color: '#92400e',
                            borderColor: '#fde68a',
                            fontWeight: 700
                          } : item.duplicate_risk === 'RATIFIED' ? {
                            background: '#ecfdf5',
                            color: '#065f46',
                            borderColor: '#a7f3d0',
                            fontWeight: 700
                          } : item.duplicate_risk === 'REJECTED' ? {
                            background: '#fef2f2',
                            color: '#b91c1c',
                            borderColor: '#fca5a5',
                            fontWeight: 700
                          } : undefined}"""
                          
    new_style = """                          style={{
                            background: item.duplicate_risk === 'PENDING_APPROVAL' || item.cnmc_code === 'PENDING_NATIONAL_MINT' ? 'rgba(216, 142, 51, 0.1)' : 'rgba(27, 35, 50, 0.05)',
                            color: item.duplicate_risk === 'PENDING_APPROVAL' || item.cnmc_code === 'PENDING_NATIONAL_MINT' ? '#B47622' : '#1B2332',
                            borderColor: item.duplicate_risk === 'PENDING_APPROVAL' || item.cnmc_code === 'PENDING_NATIONAL_MINT' ? 'rgba(216, 142, 51, 0.3)' : 'rgba(27, 35, 50, 0.2)',
                            fontWeight: 700
                          }}"""
    
    # Let's just do a regex replace to be safe
    content = re.sub(r'style=\{item\.duplicate_risk ===.*?undefined\}', new_style, content, flags=re.DOTALL)
    
    # Also change the className logic to not force 'approved' (which adds green background via CSS)
    content = content.replace('className={`status-pill ${item.duplicate_risk === \'PENDING_APPROVAL\' ? \'pending\' : item.duplicate_risk === \'REJECTED\' ? \'rejected\' : \'approved\'}`}', 'className="status-pill"')

    
    # 3. Duplicate Risk column (chip-green, chip-blue, etc)
    # Let's replace chip-green with a custom inline style or just change the classes
    # Actually, chip-green and chip-blue are fine, but let's change them to use the theme if we want.
    # Wait, the user specifically mentioned PENDING_NATIONAL_MINT. Let's just change chip-blue and chip-green to a neutral professional color
    old_chip_class = """                        <span className={`chip ${
                          item.duplicate_risk === 'RATIFIED' || item.duplicate_risk === 'HARMONIZED' ? 'chip-green' : 
                          item.duplicate_risk === 'PENDING_APPROVAL' ? 'chip-amber' :
                          item.duplicate_risk === 'REJECTED' || item.duplicate_risk === 'HIGH' ? 'chip-red' : 
                          item.duplicate_risk === 'MEDIUM' ? 'chip-amber' : 'chip-blue'
                        }`}>"""
                        
    new_chip_class = """                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '16px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: item.duplicate_risk === 'RATIFIED' || item.has_duplicate === false ? 'rgba(27, 35, 50, 0.05)' : 'rgba(216, 142, 51, 0.1)',
                          color: item.duplicate_risk === 'RATIFIED' || item.has_duplicate === false ? '#1B2332' : '#B47622',
                          border: `1px solid ${item.duplicate_risk === 'RATIFIED' || item.has_duplicate === false ? 'rgba(27, 35, 50, 0.15)' : 'rgba(216, 142, 51, 0.3)'}`
                        }}>"""
    
    content = content.replace(old_chip_class, new_chip_class)
    
    # Remove emojis from RATIFIED and REJECTED
    content = content.replace('\'✅ RATIFIED\'', '\'RATIFIED\'')
    content = content.replace('\'❌ REJECTED\'', '\'REJECTED\'')
    content = content.replace('\'⌛ PENDING GOV\'', '\'PENDING\'')
    
    with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_table_badges()
    print("Done formatting badges")
