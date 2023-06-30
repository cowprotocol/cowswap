# CoW Swap Abis

Exports relevant ABIs )types and JSON)

## Building

Build the library (it won't re-generate the types)

```bash
nx build abis
```

## Re-generate ABIs types

The types are automatically created from the Json ABIs.

These generated types are commited into the project, and are not generated automatically (assumption is, we don't need to often add new ABIs and generation takes time).

Geterate types:

```bash
nx abis abis
```
