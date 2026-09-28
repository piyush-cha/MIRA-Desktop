import re

with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Logo
content = re.sub(
    r'<img\s+src="/mira-logo\.png"\s+alt="MIRA Logo"\s+style=\{\{\s*width:\s*\'64px\',\s*height:\s*\'64px\',\s*borderRadius:\s*\'12px\',\s*marginBottom:\s*\'16px\',\s*objectFit:\s*\'contain\'\s*\}\}\s*/>',
    '''<div style={{ background: '#f8f9fa', borderRadius: '18px', padding: '16px', display: 'inline-flex', marginBottom: '16px', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/mira-logo.png" alt="MIRA Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        </div>''',
    content
)

# Replace Title
content = re.sub(
    r'<h2 style=\{\{\s*fontSize:\s*\'24px\',\s*fontWeight:\s*800,\s*marginBottom:\s*\'4px\',\s*letterSpacing:\s*\'-0\.5px\'\s*\}\}>\s*MIRA Sovereign Grid\s*</h2>',
    '''<h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px', color: '#1a1f2c' }}>
          MIRA Sovereign <span style={{ color: '#b48850' }}>Grid</span>
        </h2>''',
    content
)

# Replace Subtitle
content = re.sub(
    r'<p style=\{\{\s*fontSize:\s*\'12\.5px\',\s*color:\s*\'var\(--text-muted\)\',\s*marginBottom:\s*\'24px\'\s*\}\}>\s*National Material Governance & Autonomous CPSE Portal\s*</p>',
    '''<p style={{ fontSize: '11px', fontWeight: 700, color: '#4b5563', marginBottom: '32px', textTransform: 'uppercase', lineHeight: '1.6', letterSpacing: '0.5px' }}>
          NATIONAL MATERIAL GOVERNANCE<br/>& AUTONOMOUS CPSE PORTAL
        </p>''',
    content
)

# Replace Label 1
content = re.sub(r'SOVEREIGN IDENTIFIER / USERNAME', 'SOVEREIGN ID', content)

# Replace Placeholder 1
content = re.sub(r'placeholder="Enter username or email"', 'placeholder="Enter username"', content)

# Replace Label 2
content = re.sub(r'CRYPTOGRAPHIC PASSCODE', 'PASSWORD', content)

# Replace Placeholder 2
content = re.sub(r'placeholder="Enter passcode"', 'placeholder="............"', content)

with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
