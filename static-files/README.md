# CoW Files

This application serves as a static file hosting repository for files that are automatically uploaded to files.cow.fi via GitHub workflows.

## Usage

1. Place any files that need to be hosted on `files.cow.fi` in the `public/` directory
2. Files will be automatically uploaded to `files.cow.fi` through GitHub workflows
3. The directory structure in `public/` will be preserved in the final URL path

For example:

- A file `public/example.json` will be available at `https://files.cow.fi/cow-files/example.json`
- A file `public/docs/guide.pdf` will be available at `https://files.cow.fi/cow-files/docs/guide.pdf`

## File Organization Guidelines

- Keep files organized in meaningful subdirectories
- Use lowercase names for files and directories
- Use hyphens (-) instead of spaces in filenames
- Include version numbers in filenames when applicable

## Automatic Deployment

Files are automatically deployed to `files.cow.fi` through GitHub workflows. The workflow configuration can be found in the repository's `.github/workflows` directory.
