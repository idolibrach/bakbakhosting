export async function getPaperVersions() {
  const res = await fetch("https://fill.papermc.io/v3/projects/paper/versions");
  if (!res.ok) return [];
  const versions = await res.json();
  return versions.versions.map((v: any) => v.version.id);
}

export async function getPaperBuildInfo(version: string) {
  const res = await fetch(
    `https://fill.papermc.io/v3/projects/paper/versions/${version}/builds/latest`
  );
  if (!res.ok) return null;
  const versionInfo = await res.json();

  const res2 = await fetch(
    `https://fill.papermc.io/v3/projects/paper/versions/${version}`
  );
  if (!res2.ok) return null;
  const versionInfo2 = await res2.json();

  return {
    name: versionInfo.downloads["server:default"].name,
    link: versionInfo.downloads["server:default"].url,
    flags: versionInfo2.version.java.flags.recommended,
  };
}
