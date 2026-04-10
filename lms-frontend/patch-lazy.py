import os
import re

files = [
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/home/home.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/programmes/user-programmes.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/events/user-events.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/archive/user-archive.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/courses/user-courses.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/live/user-live.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/schedules/user-schedules.component.html'
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace <iframe with <iframe loading="lazy" unless it's already there
        # using a simple replace since it won't be there.
        content = content.replace('<iframe ', '<iframe loading="lazy" ')
        content = content.replace('loading="lazy" loading="lazy"', 'loading="lazy"')
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Patched: {file}')
