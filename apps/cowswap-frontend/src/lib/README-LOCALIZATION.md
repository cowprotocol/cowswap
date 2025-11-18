# CowSwap Internationalization

## Enable localization

A feature flag controls whether the loading of locales and the languages dropdown menu is shown.

```
isInternationalizationEnabled
```

## Lingui

Documentation: [https://lingui.dev/](https://lingui.dev/introduction)

* Add the `CROWDIN_PERSONAL_TOKEN` to both the repo and your development computer:

  * **Repository**: Add it as a secret to allow GitHub Actions to authenticate with the Crowdin API. Go to *Settings → Secrets and Variables → Actions → Repository Secrets → New Repository Secret → `CROWDIN_PERSONAL_TOKEN`*.
  * **Local development**: Add the environment variable on your machine so the CLI can authenticate with Crowdin.

### Adding a new language to the app

* Enable (uncomment) the new language (for example `fr-FR`) in `cowswap/lingui.config.ts`.
* Add the new language to the const `SUPPORTED_LOCALES` in `cowswap/libs/common-const/src/locales.ts` so it is available in the languages dropdown.
* Also enable the new language in Crowdin (see [Adding a new language in Crowdin](#adding-a-new-language-in-crowdin)).

### Adding new strings to the app

* Wrap new strings in Lingui macros: <code>t\`\`</code>, `<Trans>`, `msg`, etc. depending on context.
* Build an updated language source file `en-US.po` with:

```
yarn run i18n
```

* Push your changes to the branch connected to your Crowdin project.
* Crowdin should automatically pick up the changes, or you can sync manually.

## Crowdin

Documentation:

* [Crowdin main docs](https://support.crowdin.com/)
* [Crowdin CLI](https://support.crowdin.com/cli-tool/)
* [Crowdin GitHub integration](https://support.crowdin.com/github-integration/)

### Creating an account and project

1. Create an account at [https://crowdin.com/](https://crowdin.com/).
2. Create a `CROWDIN_PERSONAL_TOKEN`: *Account Settings → API → Personal Access Tokens → New Token*.

* For testing, use "All scopes". For production, you can restrict permissions.

3. Create a project in Crowdin:

* Add the project id to `cowswap/crowdin.yml`:

```
project_id: 'your-project-id'
```

* Name: e.g. `CowSwapDev` (name is arbitrary).
* Type: File-based project.
* Install the Onboarding app and configure:

  1. Type: App (Web, Mobile, Game)
  2. Import content from: DVCS (GitHub, etc.)
  3. Translation approach: choose as needed (AI/MT, TM, etc.)
* Connect the repository:

  * *Setup Integration / Select "Source and translation files mode"*
  * Select CowSwap’s repository
  * Select a branch for translations
  * Enable “Always import new translations from the repository”
  * Enable “Push sources” so Crowdin creates PRs after translations change
* Activate languages in *Settings → Languages* (e.g. `es-ES` and `ru-RU`). This generates the `.po` files when `en-US.po` changes.
* Files sync hourly, or can be pushed manually via *Integrations → GitHub → Sync Now*.

### Translation (first time)

Note: This section only covers the basics, but Crowdin has plenty of extra settings and features available.

1. Configure **pre-translation**: *Settings → Translation → Pre-Translate*. Enable all checkboxes:

* TM Pre-translate
* MT Pre-translate
* AI Pre-translate
* Optionally: *Approve added translations / All* and *Crowdin Translate / All languages*

2. Configure AI prompts: *Settings → AI / Pre-translation → \[+]*. Defaults are sufficient unless you need fine-tuning.

3. Translate:

* Dashboard → Hover on language row (e.g. Russian or Spanish) → Dropdown → Translate
* Select all strings
* Top right dropdown → Pre-translate:

  * Via: **AI**, **Machine Translation**, or **Translation Memory**
  * Scope: selected strings
  * Source: English (`en-US.po`)
* Click *Pre-translate*. Strings are added to a queue. After processing, translations appear alongside the source.
* Approve valid translations.
* Repeat for other languages.

4. Trigger sync: *Integrations → GitHub → Sync Now*. A new branch + PR with translations will be created.

### Adding new strings in Crowdin

When new strings are added in `en-US.po`:

* Dashboard → Hover on a language row → Dropdown → Translate
* Fill in the missing strings manually or with Crowdin tools
* Save / Approve changes
* Wait for automatic sync or push manually with *Sync Now*

### Adding a new language in Crowdin

After adding the language in Lingui and updating code:

* Go to Crowdin → Project → *Settings → Languages*
* Add the new language
* Go to dashboard → Translate → Follow the same translation steps as [above](#translation-first-time) in "3. Translate"
