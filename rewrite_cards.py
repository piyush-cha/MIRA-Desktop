import re

def rewrite_cards():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # The mapping block starts at `return (` and ends at the end of the map function.
    # It's better to find a reliable start and end string.
    start_str = "return (\n                <div\n                  key={mat.id}\n                  style={{"
    
    # We can just use string matching or regex. But regex is safer.
    # Let's find the start of the `return (` for the card and the end of the card `</div>\n              );`
    
    pattern = r"return \(\s*<div\s*key=\{mat\.id\}\s*style=\{\{.*?</div>\s*\);\s*\}\);"
    
    # Actually, the original ends with:
    #                     {/* Footer Action */}
    #                     ...
    #                     </div>
    #                   </div>
    #                 </div>
    #               );
    #             })}
    
    import textwrap
    
    new_card_code = """return (
                <div
                  key={mat.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '8px', borderBottom: '1px solid var(--border-light)' }}>
                    <div
                      onClick={() => handleCopy(mat.human_code)}
                      style={{ background: '#4f46e5', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      # {mat.human_code} {copiedText === mat.human_code ? <Check size={10} /> : <Copy size={10} />}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <CheckCircle2 size={10} /> RATIFIED
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{mat.ratification_order || 'GOV-RAT-2026-STD'}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', border: `1px solid ${critColor.border}`, color: critColor.text, background: critColor.bg, fontWeight: 700 }}>
                      {mat.criticality}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{mat.extracted_noun}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{mat.category_name}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mat.core_physics}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569', border: '1px solid #e2e8f0' }}>{mat.raw_material_composition}</span>
                        {mat.variant && (
                          <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569', border: '1px solid #e2e8f0' }}>{mat.variant}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                        CPSEs:
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                      <Cpu size={10} color="#94a3b8" />
                      {mat.machine_urn} <Copy size={10} style={{ cursor: 'pointer' }} onClick={() => handleCopy(mat.machine_urn)} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Inspect Specs <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}"""
    
    # We need to find `return (` and then the closing `);` of that div, and the `})}`
    match = re.search(r'return \(\s*<div\s*key=\{mat\.id\}.*?</div>\s*\);\s*\}\)', content, flags=re.DOTALL)
    if match:
        content = content[:match.start()] + new_card_code + content[match.end():]
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success")
    else:
        print("Could not find block to replace")

if __name__ == '__main__':
    rewrite_cards()
