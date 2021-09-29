/**
 * An object with properties reflecting the locale
 * and styles options computed during initialization
 * of the `Intl.DisplayNames` object
 *
 * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/resolvedOptions#Description).
 *
 * [Specification](https://tc39.es/ecma402/#sec-intl-displaynames-constructor)
 */
export interface DisplayNamesOptions {
  localeMatcher?: 'lookup' | 'best fit';
  style?: 'narrow' | 'short' | 'long';
  type?: 'language' | 'region' | 'script' | 'currency';
  fallback?: 'code' | 'none';
}

export interface DisplayNames {
  /**
   * Receives a code and returns a string based on the locale and options provided when instantiating
   * [`Intl.DisplayNames()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames)
   *
   * @param code The `code` to provide depends on the `type`:
   *  - If the type is "region", code should be either an [ISO-3166 two letters region code](https://www.iso.org/iso-3166-country-codes.html),
   *    or a [three digits UN M49 Geographic Regions](https://unstats.un.org/unsd/methodology/m49/).
   *  - If the type is "script", code should be an [ISO-15924 four letters script code](https://unicode.org/iso15924/iso15924-codes.html).
   *  - If the type is "language", code should be a `languageCode` ["-" `scriptCode`] ["-" `regionCode` ] *("-" `variant` )
   *    subsequence of the unicode_language_id grammar in [UTS 35's Unicode Language and Locale Identifiers grammar](https://unicode.org/reports/tr35/#Unicode_language_identifier).
   *    `languageCode` is either a two letters ISO 639-1 language code or a three letters ISO 639-2 language code.
   *  - If the type is "currency", code should be a [3-letter ISO 4217 currency code](https://www.iso.org/iso-4217-currency-codes.html).
   *
   * @returns A language-specific formatted string.
   *
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/of).
   *
   * [Specification](https://tc39.es/ecma402/#sec-Intl.DisplayNames.prototype.of).
   */
  of(code: string): string;
  /**
   * Returns a new object with properties reflecting the locale and style formatting options computed during the construction of the current
   * [`Intl/DisplayNames`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames) object.
   *
   * @returns An object with properties reflecting the locale and formatting options computed during the construction of the
   *  given [`Intl/DisplayNames`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames) object.
   *
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames/resolvedOptions).
   *
   * [Specification](https://tc39.es/ecma402/#sec-Intl.DisplayNames.prototype.resolvedOptions)
   */
  resolvedOptions(): DisplayNamesOptions;
}
