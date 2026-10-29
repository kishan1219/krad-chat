import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import { dirname, resolve } from 'node:path';
import { resources } from '../src/resources';
import { bulkRoutes, campaignCreates, campaignLists, exportRoutes, reportRoutes, summaryRoutes, uploadRoutes } from '../src/api';
import { operationPaths } from '../src/operations';

async function run() {
  const sourcePath = process.argv[2] || 'C:/Users/LENOVO/Downloads/nope/src/utility/http/ApiEndpoints.tsx';
  const source = await readFile(sourcePath, 'utf8');
  const ast = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);
  const routes: { key: string; path: string; line: number }[] = [];
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.initializer)) routes.push({ key: node.name.getText(ast), path: node.initializer.text, line: ast.getLineAndCharacterOfPosition(node.pos).line + 1 });
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const permissionSource = await readFile(resolve(dirname(sourcePath), '../Permissions.tsx'), 'utf8');
  const permissionAst = ts.createSourceFile('Permissions.tsx', permissionSource, ts.ScriptTarget.Latest, true);
  const permissionNames = new Set<string>();
  function permissionVisit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && node.name.getText(permissionAst) === 'action' && ts.isStringLiteral(node.initializer)) permissionNames.add(node.initializer.text);
    ts.forEachChild(node, permissionVisit);
  }
  permissionVisit(permissionAst);
  await writeFile('src/frontend-permissions.ts', '// Generated from the frontend permission registry. UI permissions do not replace backend authorization.\nexport const frontendPermissions: string[] = ' + JSON.stringify([...permissionNames].sort(), null, 2) + ';\n');
  const supported = new Set(['login','logout','sign-up','forgot-password','update-password','verify-otp','resent-otp','change-password','get-app-setting','update-profile','update-self-password',
    'users','user','user/','users-for-ddl','view-login-log','get-permissions','get-all-permissions','user-credit','user-credits','dashboard','countries','public-app-setting','get-all-timezones','wa-template-languages',
    'wa-reply-thread-users','wa-reply-threads-case-wise','wa-send-reply-message','wa-download-reply-file','contact-numbers-import','blacklists-import',
    'change-campaign-status-to-stop','change-voice-campaign-status-to-stop','administration/manage-campaign','administration/manage-voice-campaign',
    'repush-campaign','resend-this-sms','resend-this-voice-sms','administration/change-campaign-status-to-complete/','dlt-templates-import','administration/dlrcode-vender-import',
    'get-campaign-info/','get-campaign-current-status/','wa-get-campaign-info/','wa-get-campaign-current-status/','get-voice-campaign-info/','get-voice-campaign-current-status/',
    'send-sms/','wa-send-message/','voice-sms/','export-status/','download-export/','wa-pull-template','wa-pull-all-template','wa-subscribed-apps/',
    'group-sample-file','black-list-sample-file','normal-sms-campaign-file','custom-sms-campaign-file','dlt-sample-file','vandor-dlr-sample-file',
    ...operationPaths.filter(p => !['administration/change-user-priority-for-send-sms','user-notification-delete'].includes(p)), ...Object.keys(bulkRoutes), ...Object.keys(campaignCreates), ...Object.keys(campaignLists), ...reportRoutes, ...summaryRoutes, ...exportRoutes, ...uploadRoutes]);
  for (const [plural, spec] of Object.entries(resources)) { supported.add(plural); supported.add(spec.singular); supported.add(`${spec.singular}/`); }
  await mkdir('docs', { recursive: true });
  const duplicateKeys = [...new Set(routes.filter((r, i) => routes.findIndex(x => x.key === r.key) !== i).map(r => r.key))];
  const rows = routes.map(r => ({ ...r, status: supported.has(r.path.trim()) ? 'Implemented base contract; frontend integration verification pending' : 'Not implemented (501)' }));
  await writeFile('docs/frontend-endpoints.json', JSON.stringify({ source: sourcePath, duplicateKeys, endpoints: rows }, null, 2));
  await writeFile('docs/API_COVERAGE.md', `# Frontend API coverage\n\nGenerated from the supplied frontend. Implementation coverage is not a claim of full UI compatibility.\n\n` +
    `Endpoint declarations: ${rows.length}. Base contracts implemented: ${rows.filter(r => supported.has(r.path.trim())).length}. Explicit gaps: ${rows.filter(r => !supported.has(r.path.trim())).length}.\n\n` +
    `Duplicate frontend keys: ${duplicateKeys.join(', ')}. Resolve these before integration; JavaScript keeps the last value.\n\n` +
    `| Frontend key | Path | Status |\n|---|---|---|\n` + rows.map(r => `| ${r.key} | ${r.path} | ${r.status} |`).join('\n') + '\n');
  console.log(`Inventoried ${rows.length} endpoint declarations; ${rows.filter(r => !supported.has(r.path.trim())).length} explicit gaps.`);
}
run().catch(e => { console.error(e.message); process.exitCode = 1; });
