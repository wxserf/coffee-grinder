const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log(cmd);
  execSync(cmd, { stdio: 'inherit' });
}

function getRepo() {
  const remote = execSync('git config --get remote.origin.url').toString().trim();
  const match = remote.match(/github.com[:/](.+)\/(.+?)(?:\.git)?$/);
  if (!match) throw new Error('Cannot parse GitHub repository from remote');
  return { owner: match[1], repo: match[2] };
}

(async () => {
  run('npm version patch -m "Release %s"');
  run('npm run build');
  run('node build.js');

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN env var required');
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const tag = `v${pkg.version}`;
  const { owner, repo } = getRepo();

  const releaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'coffee-grinder-release-script'
    },
    body: JSON.stringify({ tag_name: tag, name: tag })
  });

  if (!releaseRes.ok) {
    const text = await releaseRes.text();
    throw new Error(`Release creation failed: ${releaseRes.status}\n${text}`);
  }

  const release = await releaseRes.json();
  const assetPath = path.join('dist', 'coffee-grinder.html');
  const data = await fs.promises.readFile(assetPath);

  const uploadRes = await fetch(
    `https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?name=${path.basename(assetPath)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'text/html',
        'Content-Length': data.length,
        'User-Agent': 'coffee-grinder-release-script'
      },
      body: data
    }
  );

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Asset upload failed: ${uploadRes.status}\n${text}`);
  }

  console.log('Release created:', release.html_url);
})();
