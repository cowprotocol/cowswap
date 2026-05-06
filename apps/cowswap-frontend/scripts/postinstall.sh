#!/bin/bash
# Postinstall script that applies patches for both npm/yarn (via patch-package)
# and pnpm (via direct file patching for packages in pnpm's flat store).

set -e

# Apply patch-package patches (works for @1inch and @reown, skips @wagmi/core on pnpm)
npx patch-package --error-on-fail=false 2>&1 || true

# Patch @wagmi/core directly in pnpm's store (patch-package can't find it there).
# This applies three changes to the injected connector:
#   1. Remove accountsChanged subscription from setup() — prevents cross-tab auto-connect
#      via EIP-6963 auto-discovered connectors
#   2. Remove wallet_revokePermissions from disconnect() — prevents cross-tab permission
#      revocation (MetaMask revokes for the entire origin, not per-tab)
#   3. Modify onAccountsChanged to not auto-connect disconnected connectors and not
#      auto-disconnect on empty accounts — prevents cross-tab wallet sync propagation
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Remove accountsChanged block from setup()
      if (line.includes('We shouldn') && line.includes('accountsChanged')) {
        let j = i + 1;
        while (j < lines.length && !lines[j].includes('provider.on') && !lines[j].includes('accountsChanged')) j++;
        if (j < lines.length) {
          while (j < lines.length && !lines[j].trim().startsWith('}')) j++;
          i = j;
          continue;
        }
      }

      // 2. Replace wallet_revokePermissions block
      if (line.includes('Experimental support for MetaMask disconnect')) {
        while (i < lines.length && !lines[i].includes('catch {')) i++;
        out.push('            // [PATCHED] wallet_revokePermissions revokes MetaMask permissions for the');
        out.push('            // entire origin (not per-tab), disconnecting all other open tabs. Skip it;');
        out.push('            // shimDisconnect flag is sufficient to prevent reconnect on next page load.');
        continue;
      }

      // 3. Replace onAccountsChanged to remove auto-connect and auto-disconnect
      if (line.includes('async onAccountsChanged(accounts)')) {
        out.push(line);
        // Skip original body until closing brace + comma
        i++;
        let braceDepth = 0;
        while (i < lines.length) {
          if (lines[i].includes('{')) braceDepth++;
          if (lines[i].includes('}')) braceDepth--;
          if (braceDepth < 0) break;
          i++;
        }
        // Insert patched body
        out.push('            // [PATCHED] Removed auto-connect and auto-disconnect to prevent cross-tab');
        out.push('            // wallet sync. Browser extensions fire accountsChanged across all same-origin');
        out.push('            // tabs. Only emit account change for already-connected connectors.');
        out.push('            if (accounts.length === 0)');
        out.push('                return;');
        out.push('            config.emitter.emit(\"change\", {');
        out.push('                accounts: accounts.map((x) => getAddress(x)),');
        out.push('            });');
        out.push('        },');
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
