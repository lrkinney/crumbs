// Optional native-browser integration check; Chrome + Node 22+, no npm dependencies.
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const browser = process.env.CRUMBS_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = await mkdtemp(resolve(tmpdir(), 'crumbs-design-browser-'));
// Pipe transport and a local file URL avoid opening a listening network port.
const child = spawn(browser, ['--headless', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--allow-file-access-from-files', '--remote-debugging-pipe', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
const pending = new Map();
let nextId = 0;
const delay = ms => new Promise(ok => setTimeout(ok, ms));
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++nextId;
  const timer = setTimeout(() => { pending.delete(id); reject(Error(`Timed out: ${method}`)); }, 15000);
  pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
  child.stdio[3].write(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }) + '\0');
});
let buffer = '';
child.stdio[4].on('data', chunk => {
  buffer += chunk.toString();
  let end;
  while ((end = buffer.indexOf('\0')) !== -1) {
    const raw = buffer.slice(0, end); buffer = buffer.slice(end + 1);
    if (!raw) continue;
    const message = JSON.parse(raw); const task = pending.get(message.id);
    if (!task) continue; pending.delete(message.id);
    if (message.error) task.reject(Error(message.error.message)); else task.resolve(message.result);
  }
});
const fail = error => { for (const task of pending.values()) task.reject(error); pending.clear(); };
child.once('error', fail);
child.once('exit', (code, signal) => fail(Error(`Chrome exited: ${code ?? signal}`)));
child.stdio[3].on('error', fail);
const assertions = [];
try {
  await send('Browser.getVersion');
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId); if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  await send('Page.navigate', { url: pathToFileURL(resolve(root, 'index.html')).href }, sessionId);
  let ready = false;
  for (let i = 0; i < 120; i++) { ready = await evaluate("document.documentElement.dataset.previewReady === 'true'"); if (ready) break; await delay(50); }
  assert(ready, 'Preview module did not initialize');
  assert(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Horizontal overflow at 320px');
  assertions.push('320px responsive layout has no horizontal overflow');
  assert(await evaluate("document.querySelector('#quantity').getAttribute('aria-invalid') === 'true' && document.querySelector('#quantity').getAttribute('aria-describedby').includes('quantity-error')"));
  assertions.push('Field errors are programmatically associated');
  assert(await evaluate("document.querySelector('label[for=food-name]') && document.querySelector('#food-name').required"));
  assertions.push('Native labels and required state exist');
  await evaluate("document.querySelector('#food-name').value='Rice';document.querySelector('#food-name').dispatchEvent(new Event('input',{bubbles:true}))");
  assert.equal(await evaluate("document.querySelector('#status').textContent"), 'Food name: Rice');
  await evaluate("document.querySelector('#allergy-milk').click()");
  assert(await evaluate("document.querySelector('#allergy-milk').checked"));
  assertions.push('Input and checkbox events reach application callbacks');
  assert(await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='Disabled action').disabled"));
  const focusStyle = await evaluate("(()=>{const b=document.querySelector('button');b.focus();return getComputedStyle(b).outlineStyle})()");
  assert.notEqual(focusStyle, 'none');
  assertions.push('Disabled control state and keyboard focus styling render');
  await evaluate("window.trigger=[...document.querySelectorAll('button')].find(b=>b.textContent==='Open confirmation');trigger.focus();trigger.click()");
  assert(await evaluate("document.querySelector('dialog').open && document.querySelector('dialog').contains(document.activeElement)"));
  for (let i = 0; i < 8; i++) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }, sessionId);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }, sessionId);
    assert(await evaluate("document.querySelector('dialog').contains(document.activeElement)"), 'Focus left modal');
  }
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, sessionId);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }, sessionId);
  await delay(50);
  assert(await evaluate("!document.querySelector('dialog').open && document.activeElement===trigger"));
  assertions.push('Native modal contains Tab focus, closes with Escape, and returns focus');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false }, sessionId);
  await delay(100);
  const image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, sessionId);
  await writeFile(resolve(root, 'code-preview.png'), Buffer.from(image.data, 'base64'));
  await writeFile(resolve(root, 'browser-validation.json'), JSON.stringify({ passed: true, assertions, viewports: [320, 1440], browser: await send('Browser.getVersion') }, null, 2));
  console.log(JSON.stringify({ passed: true, assertions }, null, 2));
} finally {
  if (child.exitCode === null && child.signalCode === null) { try { await send('Browser.close'); } catch {} child.kill('SIGTERM'); }
  await delay(150);
  await rm(profile, { recursive: true, force: true, maxRetries: 2 }).catch(() => {});
}
