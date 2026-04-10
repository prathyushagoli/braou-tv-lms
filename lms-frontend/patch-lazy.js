const fs = require('fs');
const glob = require('glob');

const files = [
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/home/home.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/programmes/user-programmes.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/events/user-events.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/archive/user-archive.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/courses/user-courses.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/live/user-live.component.html',
  '/Users/arungoli/Downloads/lms/lms-frontend/src/app/components/user/schedules/user-schedules.component.html'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace <iframe with <iframe loading="lazy" (unless it already has loading="lazy")
    content = content.replace(/<iframe\s+(?!.*?loading="lazy")/g, '<iframe loading="lazy" ');
    fs.writeFileSync(file, content);
    console.log(`Patched: ${file}`);
  }
});
