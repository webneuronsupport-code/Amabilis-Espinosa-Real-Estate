import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Bump version
new_html = re.sub(r'\?v=\d+', '?v=76', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)