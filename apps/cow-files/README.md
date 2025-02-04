# CoW Files

This application serves as a static file hosting repository for files that are automatically uploaded to files.cow.fi via GitHub workflows.

## Structure

```
cow-files/
├── public/        # Static files to be uploaded
├── package.json   # Basic package configuration
└── project.json   # NX project configuration
```

## Usage

1. Place any files that need to be hosted on files.cow.fi in the `public/` directory
2. Files will be automatically uploaded to files.cow.fi through GitHub workflows
3. The directory structure in `public/` will be preserved in the final URL path

## File Organization Guidelines

- Keep files organized in meaningful subdirectories
- Use lowercase names for files and directories
- Use hyphens (-) instead of spaces in filenames
- Include version numbers in filenames when applicable

## Automatic Deployment

Files are automatically deployed to files.cow.fi through GitHub workflows. The workflow configuration can be found in the repository's `.github/workflows` directory.
