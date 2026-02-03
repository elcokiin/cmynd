declare module "slug" {
  interface SlugOptions {
    /**
     * Convert to lowercase (default: true)
     */
    lower?: boolean;
    /**
     * Replacement character for spaces (default: '-')
     */
    replacement?: string;
    /**
     * Remove these characters (RegExp or string)
     */
    remove?: RegExp | string;
    /**
     * Trim whitespace (default: true)
     */
    trim?: boolean;
    /**
     * When true, returns empty string for unparseable input
     * When false, uses fallback mapping
     */
    fallback?: boolean;
  }

  /**
   * Slugify a string
   * @param str - String to slugify
   * @param options - Slugification options
   * @returns Slugified string
   */
  function slug(str: string, options?: SlugOptions): string;

  export default slug;
}
