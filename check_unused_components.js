const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend/src/components');
const pagesDir = path.join(__dirname, 'frontend/src/pages');
const srcDir = path.join(__dirname, 'frontend/src/');

const getFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            results.push(file);
        }
    });
    return results;
};

const allComponents = getFiles(componentsDir);
const allPages = getFiles(pagesDir);
const allFiles = [...allComponents, ...allPages];

const unusedComponents = [];

allFiles.forEach((file) => {
    const componentName = path.basename(file, '.jsx');
    let isUsed = false;
    const allSrcFiles = getFiles(srcDir);
    allSrcFiles.forEach((srcFile) => {
        if (srcFile !== file) {
            const content = fs.readFileSync(srcFile, 'utf8');
            if (content.includes(componentName)) {
                isUsed = true;
            }
        }
    });
    if (!isUsed) {
        unusedComponents.push(file);
    }
});

console.log('Unused components and pages:', unusedComponents);
