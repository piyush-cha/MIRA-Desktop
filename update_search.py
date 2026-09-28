import re

def update_search():
    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update placeholder
    old_placeholder = 'placeholder="Search by 7-digit MIRA Code (e.g. MIRA-6321523), URN, Noun, Grade, or CPSE local code..."'
    new_placeholder = 'placeholder="Search Sovereign Catalog by MIRA Code, URN, Noun, Grade, or CPSE code..."'
    content = content.replace(old_placeholder, new_placeholder)

    # 2. Update Domain Category Filter Pills styling
    old_pill_border = "border: selectedCategory === cat.code ? '1px solid #2563eb' : '1px solid var(--border-light)',"
    new_pill_border = "border: selectedCategory === cat.code ? '1px solid #1B2332' : '1px solid var(--border-light)',"
    content = content.replace(old_pill_border, new_pill_border)

    old_pill_bg = "background: selectedCategory === cat.code ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-card)',"
    new_pill_bg = "background: selectedCategory === cat.code ? '#1B2332' : 'var(--bg-card)',"
    content = content.replace(old_pill_bg, new_pill_bg)

    old_pill_color = "color: selectedCategory === cat.code ? '#2563eb' : 'var(--text-secondary)',"
    new_pill_color = "color: selectedCategory === cat.code ? '#ffffff' : 'var(--text-secondary)',"
    content = content.replace(old_pill_color, new_pill_color)

    with open('src/pages/MiraUnifiedCatalogPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated search placeholder and filter pills styling")

if __name__ == '__main__':
    update_search()
