import re

def simplify_header():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace the big dark block with a simple white block.
    # The block starts at `        {/* Sovereign National Hero Header */}`
    # and ends right before `        {/* Filter Controls & Search */}`
    
    start_marker = "{/* Sovereign National Hero Header */}"
    end_marker = "{/* Filter Controls & Search */}"
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx != -1 and end_idx != -1:
        new_header = """{/* Clean Sovereign National Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(216, 142, 51, 0.1)', border: '1px solid rgba(216, 142, 51, 0.3)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700, color: '#B47622', marginBottom: '6px' }}>
              <ShieldCheck size={12} />
              MIRA NATIONAL MASTER
            </div>
            <h3 className="section-title" style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
              MIRA Sovereign Unified Material Master
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '800px' }}>
              Displaying Government Approved & Ratified MIRA Standard Codes with standardized physical definitions and cross-CPSE ERP links.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fetchCatalog()}
              className="gov-btn secondary small"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="gov-btn primary small"
            >
              <Plus size={14} />
              Propose & Mint Sovereign Code
            </button>
          </div>
        </div>

        """
        
        content = content[:start_idx] + new_header + content[end_idx:]
        
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
            
if __name__ == '__main__':
    simplify_header()
    print("Done simplifying header")
