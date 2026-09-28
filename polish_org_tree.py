import re

def polish_org_tree():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the tree view rendering block
    old_tree = """                  <div key={idx} className="tree-node-item">

                    <div className="tree-node-row">

                      <span className="node-type-badge holding">{node.type_code}</span>

                      <span className="node-name-text"><b>{node.unit_name}</b> ({node.unit_code})</span>

                      <span className="node-location"><Building2 size={12} /> {node.location || 'Headquarters'}</span>

                    </div>



                    {node.children?.length > 0 && (

                      <div className="tree-children-container">

                        {node.children.map((child: any, cidx: number) => (

                          <div key={cidx} className="tree-node-child">

                            <span className="node-type-badge area">{child.type_code}</span>

                            <span>{child.unit_name} (<code>{child.unit_code}</code>)</span>

                            <span className="node-location"><Building2 size={11} /> {child.location}</span>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>"""

    new_tree = """                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '16px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-canvas, #f8fafc)', border: '1px solid var(--border-medium)', borderRadius: '8px' }}>

                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{node.type_code}</span>

                      <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}><b>{node.unit_name}</b> <span style={{ color: 'var(--text-muted)' }}>({node.unit_code})</span></span>

                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}><Building2 size={14} /> {node.location || 'Headquarters'}</span>

                    </div>



                    {node.children?.length > 0 && (

                      <div style={{ paddingLeft: '32px', borderLeft: '2px dashed var(--border-subtle)', marginLeft: '16px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                        {node.children.map((child: any, cidx: number) => (

                          <div key={cidx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-light)', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>

                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{child.type_code}</span>

                            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{child.unit_name} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>({child.unit_code})</span></span>

                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}><Building2 size={12} /> {child.location}</span>

                          </div>

                        ))}

                      </div>

                    )}

                  </div>"""

    if old_tree in content:
        content = content.replace(old_tree, new_tree)
        with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Polished org tree layout")
    else:
        print("Could not find the exact tree block string.")

if __name__ == '__main__':
    polish_org_tree()
