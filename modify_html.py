#!/usr/bin/env python3
import re

with open('/tmp/cc-agent/65079049/project/index.html', 'r') as f:
    content = f.read()

# Remove all icon-3d structures with their contents
patterns_to_remove = [
    r'<span class="pain-card-icon">.*?</span>\s*',
    r'<div class="icon-3d">.*?</div>\s*',
    r'<span class="survey-step-icon">.*?</span>\s*',
]

for pattern in patterns_to_remove:
    content = re.sub(pattern, '', content, flags=re.DOTALL)

# Remove promise card icons (3D shield, etc)
content = re.sub(r'<span class="promise-icon">.*?</span>\s*', '', content, flags=re.DOTALL)

# Remove popup gift icon
content = re.sub(r'<div class="popup-icon">.*?</div>\s*', '', content, flags=re.DOTALL)

# Remove comparison table icon
content = re.sub(r'<div class="compare-table-icon">.*?</div>\s*', '', content, flags=re.DOTALL)

# Remove industry tab icons
content = re.sub(r'<span class="ind-icon">.*?</span>\s*', '', content, flags=re.DOTALL)

# Save the modified content
with open('/tmp/cc-agent/65079049/project/index.html', 'w') as f:
    f.write(content)

print("Icons removed successfully")
