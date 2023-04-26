// cucumber.js
let common = [
    'src/features/**/*.feature',                // Specify our feature files
    '--require-module ts-node/register',    // Load TypeScript module
    '--require src/step-definitions/**/*.ts',  // Load step definitions
    '--format progress-bar',
    '--format json:reports/cucumber_report.json',
    '--format html:reports/cucumber.html',
    '--format junit:reports/junit.xml'
].join(' ');

module.exports = {
    default: common
};
