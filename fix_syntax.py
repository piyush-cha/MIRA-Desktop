import sys

def fix_syntax_error():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # We want to remove lines 556 through 617 (0-indexed: 555 through 616).
    # Let's verify line contents first.
    if "})}}" in lines[555] and "})}" in lines[616]:
        # Keep everything up to line 555 (index 554)
        # Add `            })}`
        # Keep everything from line 618 (index 617)
        new_lines = lines[:555] + ["            })}\n"] + lines[617:]
        
        with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Successfully fixed syntax error by removing duplicate card remainder.")
    else:
        print("Lines did not match expected contents. Please investigate.")
        print(f"Line 556 (idx 555): {lines[555]}")
        print(f"Line 617 (idx 616): {lines[616]}")

if __name__ == '__main__':
    fix_syntax_error()
