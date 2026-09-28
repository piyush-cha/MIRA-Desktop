import re

def polish_ai_modal():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Header Icon
    content = content.replace(
        "background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(79, 70, 229, 0.2))'",
        "background: 'linear-gradient(135deg, #1e293b, #0f172a)'"
    )
    content = content.replace(
        "<Sparkles size={20} color=\"#2563EB\" />",
        "<Sparkles size={20} color=\"#38bdf8\" />"
    )

    # 2. Header Pill (No duplicates)
    content = content.replace(
        "background: reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)'",
        "background: reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.1)'"
    )
    content = content.replace(
        "color: reviewItem.has_duplicate ? '#DC2626' : '#059669'",
        "color: reviewItem.has_duplicate ? '#DC2626' : '#0284c7'"
    )
    content = content.replace(
        "border: `1px solid ${reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`",
        "border: `1px solid ${reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.2)'}`"
    )

    # 3. Central Circle
    content = content.replace(
        "linear-gradient(135deg, #10B981, #059669)",
        "linear-gradient(135deg, #334155, #1e293b)"
    )
    content = content.replace(
        "boxShadow: reviewItem.has_duplicate \n\n                        ? '0 4px 12px rgba(37, 99, 235, 0.35)'\n\n                        : '0 4px 12px rgba(16, 185, 129, 0.35)'",
        "boxShadow: reviewItem.has_duplicate \n\n                        ? '0 4px 12px rgba(37, 99, 235, 0.35)'\n\n                        : '0 4px 12px rgba(30, 41, 59, 0.35)'"
    )
    content = content.replace(
        "color: reviewItem.has_duplicate ? '#2563EB' : '#059669'",
        "color: reviewItem.has_duplicate ? '#2563EB' : '#1e293b'"
    )

    # 4. Matrix Text Colors
    content = content.replace(
        "color: '#10B981'",
        "color: '#0284c7'"
    )
    content = content.replace(
        "color: '#059669'",
        "color: '#0284c7'"
    )

    # 5. Right Panel - Status Pill for Unique
    content = content.replace(
        "background: reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)'",
        "background: reviewItem.has_duplicate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.08)'"
    )
    content = content.replace(
        "color: reviewItem.has_duplicate ? '#DC2626' : '#64748B'",
        "color: reviewItem.has_duplicate ? '#DC2626' : '#0284c7'"
    )

    # 6. Distinct Single-Sourced Engineering Profile label
    content = content.replace(
        "<span style={{ background: '#f1f5f9', color: '#64748B', padding: '2px 6px', borderRadius: '4px' }}>\n\n                            Distinct Single-Sourced Engineering Profile\n\n                          </span>",
        "<span style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>\n\n                            Distinct Single-Sourced Engineering Profile\n\n                          </span>"
    )

    # 7. Nominate Button
    # Note: we already replaced the green gradient above globally! 
    # Let's ensure the background override on the nominate button works:
    content = content.replace(
        "background: 'linear-gradient(135deg, #334155, #1e293b)', gap: '6px'",
        "background: '#1e293b', gap: '6px', color: '#fff', border: 'none'"
    )

    with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Polished AI Duplicate Audit modal colors to slate/blue")

if __name__ == '__main__':
    polish_ai_modal()
