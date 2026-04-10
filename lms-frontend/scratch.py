import os
import re

files_to_check = [
    'src/app/components/admin/courses/courses.component.html',
    'src/app/components/user/courses/user-courses.component.html'
]

for filepath in files_to_check:
    full_path = os.path.join('/Users/arungoli/Downloads/lms/lms-frontend', filepath)
    with open(full_path, 'r') as f:
        content = f.read()
    
    # regex to find the inner search inputs without appAutoFocus
    # matches: <input ... class="inner-search-input">
    # we want: <input ... class="inner-search-input" appAutoFocus>
    
    # We will do a safe replacement
    modified = content.replace('class="inner-search-input">', 'class="inner-search-input" appAutoFocus>')
    
    with open(full_path, 'w') as f:
        f.write(modified)
    
    print(f"Updated {filepath}")
