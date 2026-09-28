import re

def polish_sidebar():
    with open('src/index.css', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. We will find .nav-item and update it to have relative positioning and new active styles.
    # Currently:
    # .nav-item.active { background: rgba(37, 99, 235, 0.1); color: #2563eb; font-weight: 700; border-right: 3px solid #2563eb; }
    
    # We will replace the active style entirely, and inject the pseudo-elements.
    css_to_inject = """
.nav-item {
  position: relative;
  z-index: 1;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  z-index: -1;
  transition: all 0.2s ease;
}

.nav-item:hover::before {
  background: var(--bg-hover);
}

.nav-item.active { 
  background: rgba(37, 99, 235, 0.05); 
  color: var(--text-primary); 
  font-weight: 600; 
  border-right: 3px solid #2563eb; 
}

.nav-item.active::before {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.nav-item.active svg {
  color: #38bdf8;
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}
"""
    
    # Remove old .nav-item.active block(s)
    content = re.sub(r'\.nav-item\.active\s*\{[^}]+\}', '', content)
    
    # Append the new css to the end of the file
    content += "\n\n/* Professional Sidebar Polishing */\n" + css_to_inject

    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Updated index.css with professional sidebar styling")

if __name__ == '__main__':
    polish_sidebar()
