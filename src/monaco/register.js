export function registerLanguages(
  languages,
  fetchLanguageInfo,
  monaco
) {
  for (const extensionPoint of languages) {
    const { id: languageId } = extensionPoint;
    monaco.languages.register(extensionPoint);

    monaco.languages.onLanguage(languageId, async () => {
      const { tokensProvider, configuration } = await fetchLanguageInfo(languageId);

      if (tokensProvider != null) {
        monaco.languages.setTokensProvider(languageId, tokensProvider);
      }

      if (configuration != null) {
        monaco.languages.setLanguageConfiguration(languageId, configuration);
      }
    });
  }
}
