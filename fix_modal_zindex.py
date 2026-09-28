import re

def fix_modal_zindex():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to change:
    # return (
    #   <AppShell ...>
    #      ...
    #      {selectedMaterial && ( ... )}
    #   </AppShell>
    # )
    # to:
    # return (
    #   <>
    #     <AppShell ...>
    #        ...
    #     </AppShell>
    #     {selectedMaterial && ( ... )}
    #   </>
    # )
    
    # 1. Find the start of the return
    old_return_start = """  return (
    <AppShell
      currentPage="cnmc"
      onNavigate={onNavigate}
      title="National Unified Master"
    >"""
    new_return_start = """  return (
    <>
    <AppShell
      currentPage="cnmc"
      onNavigate={onNavigate}
      title="National Unified Master"
    >"""
    content = content.replace(old_return_start, new_return_start)
    
    # 2. Find the modal block
    modal_regex = r"(      \{/\* Detail Slide-Over / Modal \*/\}.*?zIndex: 1000,\n          padding: '20px'\n        \}\}.*?)\n    </AppShell>\n  \);\n\};"
    
    # We want to extract the modal block, close AppShell, then place modal block, then close fragment
    def replacement(match):
        modal_block = match.group(1)
        return f"    </AppShell>\n\n{modal_block}\n    </>\n  );\n}};"
        
    content, count = re.subn(modal_regex, replacement, content, flags=re.DOTALL)
    
    if count > 0:
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Moved modal outside AppShell")
    else:
        print("Failed to find modal block at the end of the file.")

if __name__ == '__main__':
    fix_modal_zindex()
