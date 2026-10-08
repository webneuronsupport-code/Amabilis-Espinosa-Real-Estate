import re
import glob

html_files = glob.glob('*.html')
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Bump version parameters on script tags
    html = re.sub(r'src="(js/data\.js\?v=)\d+"', r'src="\g<1>81"', html)
    html = re.sub(r'src="(js/main\.js\?v=)\d+"', r'src="\g<1>81"', html)
    html = re.sub(r'href="(css/styles\.css\?v=)\d+"', r'href="\g<1>81"', html)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(html)

print("Versions bumped in HTML files")