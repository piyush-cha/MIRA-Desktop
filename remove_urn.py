import re

def remove_urn():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the footer
    old_footer = """                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                      <Cpu size={10} color="#94a3b8" />
                      {mat.machine_urn} <Copy size={10} style={{ cursor: 'pointer' }} onClick={() => handleCopy(mat.machine_urn)} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Inspect Specs <ChevronRight size={12} />
                    </div>
                  </div>"""
                  
    new_footer = """                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }} onClick={() => setSelectedMaterial(mat)}>
                      Inspect Specs <ChevronRight size={12} />
                    </div>
                  </div>"""

    if old_footer in content:
        content = content.replace(old_footer, new_footer)
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: URN removed")
    else:
        print("Could not find footer block. Trying regex.")
        # fallback regex
        pattern = r"\{/\* Footer \*/\}.*?<Cpu size=\{10\} color=\"#94a3b8\" />.*?Inspect Specs <ChevronRight size=\{12\} />.*?</div>\s*</div>"
        match = re.search(pattern, content, flags=re.DOTALL)
        if match:
            content = content[:match.start()] + new_footer + content[match.end():]
            with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
                f.write(content)
            print("Success with regex")
        else:
            print("Failed to replace")
            
if __name__ == '__main__':
    remove_urn()
