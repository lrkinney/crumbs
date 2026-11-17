import ts from 'typescript';
import { readFile } from 'node:fs/promises';

// Dependency-free repository linting using the project's installed TypeScript parser.
const configPath = ts.findConfigFile('.', ts.sys.fileExists, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, '.');
const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true, noUnusedLocals: true, noUnusedParameters: true });
const diagnostics = ts.getPreEmitDiagnostics(program);
const problems = [];
for (const file of program.getSourceFiles().filter(f => /(^|\/)src\//.test(f.fileName) && !f.fileName.includes('/node_modules/') && !f.fileName.includes('.generated.'))) {
  function inspect(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) problems.push(`${file.fileName}: use a specific type instead of any`);
    if (ts.isCallExpression(node) && /^(console\.log|eval)$/.test(node.expression.getText(file))) problems.push(`${file.fileName}: remove ${node.expression.getText(file)}`);
    if (ts.isImportDeclaration(node) && /@react-navigation\//.test(node.moduleSpecifier.text)) problems.push(`${file.fileName}: import navigation APIs from Expo Router`);
    ts.forEachChild(node, inspect);
  }
  inspect(file);
}
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
if (packageJson.scripts['reset-project']) problems.push('Remove the destructive starter reset command.');
if (diagnostics.length) console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCanonicalFileName: f => f, getCurrentDirectory: ts.sys.getCurrentDirectory, getNewLine: () => '\n' }));
for (const problem of problems) console.error(problem);
if (diagnostics.length || problems.length) process.exitCode = 1;
else console.log('Lint passed: unused code, type safety, navigation imports, and source hygiene.');
