import re

filepath = 'src/pages/ProfilePage.css'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all @import lines
import_pattern = re.compile(r"^@import\s+url\([^)]+\);?\s*$", re.MULTILINE)
imports = import_pattern.findall(content)

if imports:
    # Remove them from their current positions
    cleaned = import_pattern.sub('', content)
    
    # Prepend them at the very top
    import_block = '\n'.join(imports) + '\n\n'
    final = import_block + cleaned
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final)
    
    print(f'Moved {len(imports)} @import statements to top of file:')
    for imp in imports:
        print(f'  {imp[:80]}...')
else:
    print('No @import statements found.')
