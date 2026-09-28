import re

def make_more_small():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Reduce padding in government approval header
    content = content.replace("padding: '12px 18px',", "padding: '8px 12px',")
    
    # Reduce main body padding and gaps
    content = content.replace("padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px'", "padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px'")
    
    # Reduce padding in MIRA CODE block
    content = content.replace("padding: '12px 14px', borderRadius: '10px'", "padding: '8px 10px', borderRadius: '8px'")
    
    # Reduce gap in MIRA CODE header
    content = content.replace("marginBottom: '6px'", "marginBottom: '2px'")
    
    # Reduce Machine Code padding
    content = content.replace("padding: '6px 8px',", "padding: '4px 6px',")
    content = content.replace("marginTop: '8px',", "marginTop: '4px',")
    
    # Reduce Spec padding/margins
    content = content.replace("marginBottom: '4px'", "marginBottom: '0px'")
    content = content.replace("marginTop: '4px', lineHeight: 1.45", "marginTop: '2px', lineHeight: 1.3")
    
    # Reduce Ratification Basis block padding
    content = content.replace("padding: '12px 14px',", "padding: '8px 10px',")
    
    # Reduce Linked CPSEs block padding
    content = content.replace("gap: '8px'", "gap: '4px'")
    
    # Make font sizes slightly smaller
    content = content.replace("fontSize: '15px'", "fontSize: '13px'") # Spec noun
    content = content.replace("fontSize: '12.5px'", "fontSize: '11px'") # Spec desc
    
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    make_more_small()
    print("Done making more small")
