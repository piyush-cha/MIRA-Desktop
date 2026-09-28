import re

def polish_legacy_page():
    with open('src/pages/LegacyCodesPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add a professional page title inside gov-page-container
    header_html = """
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={24} color="#2563eb" />
            Legacy Material Codes & Harmonization Mapping
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={14} />
            Cross-CPSE Heterogeneous Part Numbers Aligned to Master CNMC Taxonomy
          </p>
        </div>
        
        {/* Top Control Bar */}
"""
    content = content.replace('{/* Top Control Bar */}', header_html)

    # 2. Make Harmonization Status pill professional
    # Find: <span className={`status-pill ${(c.mapping_status || 'SUGGESTED').toLowerCase()}`}>
    # Replace it to handle ISOLATED, etc.
    pill_html = """<span className={`status-pill ${(c.mapping_status || 'SUGGESTED').toLowerCase()} ${c.mapping_status === 'ISOLATED' ? 'high' : ''}`}>"""
    content = content.replace("<span className={`status-pill ${(c.mapping_status || 'SUGGESTED').toLowerCase()}`}>", pill_html)

    # 3. Enhance Golden Code display if UNMAPPED
    # Find: <div className="font-mono text-xs font-bold text-emerald">{c.ground_truth_cnmc}</div>
    # Replace with something that checks for UNMAPPED
    golden_code_html = """
                      {c.ground_truth_cnmc === 'UNMAPPED' ? (
                        <div className="font-mono text-xs font-bold text-muted">UNMAPPED</div>
                      ) : (
                        <div className="font-mono text-xs font-bold text-emerald">{c.ground_truth_cnmc}</div>
                      )}
"""
    content = content.replace('<div className="font-mono text-xs font-bold text-emerald">{c.ground_truth_cnmc}</div>', golden_code_html)

    with open('src/pages/LegacyCodesPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Updated LegacyCodesPage.tsx")

if __name__ == '__main__':
    polish_legacy_page()
