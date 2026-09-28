import re

def polish_cpse_header():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Enterprise Node pill
    old_pill = "<span className=\"status-pill active\">{isCpseAdmin ? 'Enterprise Node' : 'Sovereign Entity'}</span>"
    new_pill = "<span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isCpseAdmin ? 'Enterprise Node' : 'Sovereign Entity'}</span>"
    content = content.replace(old_pill, new_pill)

    # 2. Isolated Enterprise Silo bar
    old_silo = """              <div style={{ 

                display: 'inline-flex', 

                alignItems: 'center', 

                gap: '8px', 

                background: 'rgba(16, 185, 129, 0.08)', 

                border: '1px solid rgba(16, 185, 129, 0.25)', 

                padding: '6px 14px', 

                borderRadius: '20px',

                color: '#065F46',

                fontSize: '12px',

                fontWeight: 700

              }}>

                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />

                <span>Isolated Enterprise Silo: <b>{selectedCpseCode}</b></span>

                <span style={{ fontSize: '10px', background: '#D1FAE5', color: '#065F46', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>

                  LOCKED

                </span>

              </div>"""

    new_silo = """              <div style={{ 

                display: 'inline-flex', 

                alignItems: 'center', 

                gap: '10px', 

                background: 'var(--bg-canvas, #f8fafc)', 

                border: '1px solid var(--border-medium, #e2e8f0)', 

                padding: '6px 14px', 

                borderRadius: '8px',

                color: 'var(--text-secondary, #475569)',

                fontSize: '12px',

                fontWeight: 600

              }}>

                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#94a3b8', display: 'inline-block' }} />

                <span>Isolated Enterprise Silo: <b style={{ color: 'var(--text-primary)' }}>{selectedCpseCode}</b></span>

                <span style={{ fontSize: '10px', background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-light, #f1f5f9)', color: 'var(--text-muted, #94a3b8)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>

                  LOCKED

                </span>

              </div>"""

    content = content.replace(old_silo, new_silo)

    with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Polished CPSE Header colors")

if __name__ == '__main__':
    polish_cpse_header()
