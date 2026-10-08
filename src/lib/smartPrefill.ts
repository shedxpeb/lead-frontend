// Smart Prefill utility for cross-module data reuse
// It takes the current form data, a source object (e.g., a Lead),
// a mapping of source keys to destination form fields, and a Set of fields
// the user has already edited. Only fields not edited are pre‑filled.

export interface Mapping {
  [sourceKey: string]: string; // destination field name
}

/**
 * Generate a partial data object to pre‑fill a form.
 *
 * @param currentData   The current values from `watch()` or the form state.
 * @param source        The source entity (Lead, Customer, etc.).
 * @param mapping       Mapping from source property names to form field names.
 * @param editedFields  Set of form field names the user has manually edited.
 * @returns             An object containing only the fields that should be updated.
 */
export function smartPrefill(
  currentData: Record<string, unknown>,
  source: Record<string, unknown>,
  mapping: Mapping,
  editedFields: Set<string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [srcKey, destKey] of Object.entries(mapping)) {
    // Skip fields the user has already edited
    if (editedFields.has(destKey)) continue;
    // Prefer the value from the source if it exists
    const value = source[srcKey];
    if (value !== undefined && value !== null && value !== '') {
      result[destKey] = value;
    }
  }
  return result;
}
