#!/bin/bash
# Postinstall script that applies patches for both npm/yarn (via patch-package)
# and pnpm (via direct file patching for packages in pnpm's flat store).

set -e

# Apply patch-package patches (works for @1inch and @reown, skips @wagmi/core on pnpm)
npx patch-package --error-on-fail=false 2>&1 || true

# Patch @wagmi/core directly in pnpm's store (patch-package can't find it there).
# This applies the same changes as @wagmi+core+3.3.2.patch:
#   1. Remove accountsChanged subscription from setup() — prevents cross-tab auto-connect
#   2. Remove wallet_revokePermissions from disconnect() — prevents cross-tab permission revocation
PATCHED=0
for f in $(find ../../node_modules/.pnpm -path "*@wagmi+core@3.3.2*" -name "injected.js" -path "*/dist/esm/*" 2>/dev/null); do
  # Skip if already patched
  if grep -q "\[PATCHED\]" "$f" 2>/dev/null; then
    echo "Already patched: $f"
    PATCHED=$((PATCHED + 1))
    continue
  fi

  node -e "
    const fs = require('fs');
    const path = process.argv[1];
    const lines = fs.readFileSync(path, 'utf8').split('\n');
    const out = [];
    let skip = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Remove accountsChanged block from setup()
      if (line.includes('We shouldn') && line.includes('accountsChanged')) {
        // Skip this comment line and the next 4 lines (if/accountsChanged/provider.on/closing brace)
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('provider.on') && !lines[j].includes('accountsChanged')) j++;
        if (j < lines.length) {
          // Find the closing brace of this if block
          while (j < lines.length && !lines[j].trim().startsWith('}')) j++;
          i = j; // skip to after closing brace
          continue;
        }
      }

      // 2. Replace wallet_revokePermissions block
      if (line.includes('Experimental support for MetaMask disconnect')) {
        // Skip until 'catch { }'
        while (i < lines.length && !lines[i].includes('catch {')) i++;
        out.push('            // [PATCHED] wallet_revokePermissions revokes MetaMask permissions for the');
        out.push('            // entire origin (not per-tab), disconnecting all other open tabs. Skip it;');
        out.push('            // shimDisconnect flag is sufficient to prevent reconnect on next page load.');
        continue;
      }

      out.push(line);
    }

    fs.writeFileSync(path, out.join('\n'));
    console.log('Patched: ' + path);
  " "$f" && PATCHED=$((PATCHED + 1))
done

if [ "$PATCHED" -gt 0 ]; then
  echo "@wagmi/core@3.3.2 patched successfully ($PATCHED files)"
else
  echo "Warning: No @wagmi/core@3.3.2 files found to patch"
fi
