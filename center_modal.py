import re

def center_modal():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # The background wrapper
    old_wrapper = """        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000
        }}>"""
    
    new_wrapper = """        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>"""
        
    # The modal container
    old_container = """          <div style={{
            width: '100%',
            maxWidth: '620px',
            background: 'var(--bg-card)',
            height: '100%',
            boxShadow: '-6px 0 30px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>"""
          
    new_container = """          <div style={{
            width: '100%',
            maxWidth: '620px',
            background: 'var(--bg-card)',
            maxHeight: '90vh',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>"""

    if old_wrapper in content and old_container in content:
        content = content.replace(old_wrapper, new_wrapper)
        content = content.replace(old_container, new_container)
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Made modal centered")
    else:
        print("Could not find blocks. Printing surrounding code for regex...")
        # fallback regex
        pass

if __name__ == '__main__':
    center_modal()
