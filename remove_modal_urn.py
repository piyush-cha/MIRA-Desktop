import re

def remove_modal_urn():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the block to remove
    pattern = r"\{/\* 3\. Machine Code Connection \*/\}.*?\{/\* 4\. Same Material Linked Across CPSEs \*/\}"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, "{/* 3. Same Material Linked Across CPSEs */}", content, flags=re.DOTALL)
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Removed URN from modal")
    else:
        print("Could not find the URN block in modal using regex.")

if __name__ == '__main__':
    remove_modal_urn()
