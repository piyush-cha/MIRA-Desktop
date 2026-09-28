import re

def revert_titles():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('<h3 className="section-title">Material Catalog Studio</h3>', '<h3 className="section-title">CPSE Material Catalog & Intra-Enterprise Duplicate Detector</h3>')
    content = content.replace('<p style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Manage local materials and resolve duplicates.</p>', '<p style={{ fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Standardize local plant items against CNMC Golden records and resolve duplicate entries.</p>')
    
    with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    revert_titles()
    print("Done reverting titles")
