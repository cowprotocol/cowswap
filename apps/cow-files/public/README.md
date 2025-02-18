# Public Directory Structure

This directory contains all files that will be uploaded to files.cow.fi. The directory structure here will be exactly mirrored in the final URL path.

## Usage

1. Place any files or folders in this directory
2. The structure will be preserved and available at `https://files.cow.fi/cow-files/`

For example:

- A file `public/example.json` will be available at `https://files.cow.fi/cow-files/example.json`
- A file `public/docs/guide.pdf` will be available at `https://files.cow.fi/cow-files/docs/guide.pdf`

## Organization Tips

- Create subdirectories as needed for your use case
- Use clear, lowercase names for files and directories
- Use hyphens (-) instead of spaces in filenames
- Consider adding version numbers to filenames if needed (e.g., `guide-v1.pdf`)

## Important Notes

- All files in this directory are publicly accessible
- Files are automatically synced when changes are pushed to the main branch
- The URL structure includes the `cow-files/` prefix to avoid conflicts with other applications
- Temporary files (_.tmp, _.temp, .DS_Store) are automatically excluded from upload
