const fs = require('fs');
const path = './src/data/yearData.ts';
let content = fs.readFileSync(path, 'utf8');

const businessDepts = [
  'Accounting and Finance',
  'Supply Chain and Information Systems',
  'Marketing and International Business',
  'Human Resource and Organizational Development',
  'Hospitality'
];

let deptIndex = 0;
content = content.replace(/department:\s*'([^']+)'/g, (match, p1) => {
  const newDept = businessDepts[deptIndex % businessDepts.length];
  deptIndex++;
  return `department: '${newDept}'`;
});

fs.writeFileSync(path, content);
console.log('Updated yearData.ts');
