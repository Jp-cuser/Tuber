import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function script(name: string): string {
  return readFileSync(join(process.cwd(), name), 'utf8');
}

describe('Windows scripts', () => {
  it('SETUP.bat supports safe setup conventions', () => {
    const setup = script('SETUP.bat');
    expect(setup).toContain('cd /d "%~dp0"');
    expect(setup).toContain('call npm.cmd ci');
    expect(setup).toContain('if not exist ".env.local"');
    expect(setup).toContain('node scripts\\check-node-version.mjs');
  });

  it('LAUNCH.bat checks readiness and preserves exit codes', () => {
    const launch = script('LAUNCH.bat');
    expect(launch).toContain('cd /d "%~dp0"');
    expect(launch).toContain('call npm.cmd run dev');
    expect(launch).toContain('scripts\\open-browser.ps1');
    expect(launch).toContain('exit /b %APP_EXIT%');
  });
});
