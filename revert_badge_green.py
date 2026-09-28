import re

def revert_badge_to_green():
    with open('src/pages/CpseAdminPortalPage.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Revert the gold back to green for the badge
    content = content.replace('rgba(216, 142, 51, 0.08)', 'rgba(16, 185, 129, 0.08)')
    content = content.replace('rgba(216, 142, 51, 0.3)', 'rgba(16, 185, 129, 0.25)')
    content = content.replace('#B47622', '#065F46')
    content = content.replace('#D88E33', '#10B981')
    content = content.replace('rgba(216, 142, 51, 0.6)', 'rgba(16, 185, 129, 0.6)')
    content = content.replace('rgba(216, 142, 51, 0.15)', '#D1FAE5')
    
    with open('src/pages/CpseAdminPortalPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    revert_badge_to_green()
    print("Done reverting badge to green")
