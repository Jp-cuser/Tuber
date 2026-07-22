const major = Number(process.versions.node.split('.')[0]);
if (major !== 24) {
  console.error(
    `Node.js 24.x is required. Current version: ${process.version}`,
  );
  process.exit(1);
}
console.log(`Node.js ${process.version} is supported.`);
