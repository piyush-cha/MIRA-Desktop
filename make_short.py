import re

def make_short():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Shorten APPROVED BY GOVERNMENT OF INDIA
    content = content.replace('APPROVED BY GOVERNMENT OF INDIA', 'GOV APPROVED')
    
    # 2. Shorten SOVEREIGN MIRA UNIFIED CODE (7-DIGIT)
    content = content.replace('SOVEREIGN MIRA UNIFIED CODE (7-DIGIT)', 'MIRA CODE')
    
    # 3. Shorten CONNECTED SOVEREIGN MACHINE CODE:
    content = content.replace('CONNECTED SOVEREIGN MACHINE CODE:', 'MACHINE CODE:')
    
    # 4. Shorten WHAT IS THIS MATERIAL? (SPECIFICATION)
    content = content.replace('WHAT IS THIS MATERIAL? (SPECIFICATION)', 'SPECIFICATION')
    
    # 5. Shorten GOVERNMENT APPROVAL REASON & RATIFICATION BASIS:
    content = content.replace('GOVERNMENT APPROVAL REASON & RATIFICATION BASIS:', 'RATIFICATION BASIS:')
    
    # 6. Remove the long italicized reason text to make the card shorter
    content = content.replace('<div style={{ fontSize: \'12px\', color: \'#78350f\', lineHeight: 1.45, fontStyle: \'italic\' }}>\n                        "{mat.approval_reason}"\n                      </div>', '')
    
    # 7. Shorten SAME MATERIAL LINKED FROM DIFFERENT CPSEs:
    content = content.replace('SAME MATERIAL LINKED FROM DIFFERENT CPSEs:', 'LINKED CPSEs:')
    
    # 8. Shorten Inspect Full Sovereign Spec
    content = content.replace('Inspect Full Sovereign Spec &rarr;', 'View Spec &rarr;')
    content = content.replace('Inspect Full Sovereign Spec →', 'View Spec →')
    
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    make_short()
    print("Done making text short")
