// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export const apiVersion = "7.2-preview.1";
export const batchApiVersion = "5.0";
export const markdownCommentsApiVersion = "7.2-preview.4";
export function createEnumMapping(enumObject) {
    const mapping = {};
    for (const [key, value] of Object.entries(enumObject)) {
        if (typeof key === "string" && typeof value === "number") {
            mapping[key.toLowerCase()] = value;
        }
    }
    return mapping;
}
export function mapStringToEnum(value, enumObject, defaultValue) {
    if (!value)
        return defaultValue;
    const enumMapping = createEnumMapping(enumObject);
    return enumMapping[value.toLowerCase()] ?? defaultValue;
}
/**
 * Maps an array of strings to an array of enum values, filtering out invalid values.
 * @param values Array of string values to map
 * @param enumObject The enum object to map to
 * @returns Array of valid enum values
 */
export function mapStringArrayToEnum(values, enumObject) {
    if (!values)
        return [];
    return values.map((value) => mapStringToEnum(value, enumObject)).filter((v) => v !== undefined);
}
/**
 * Converts a TypeScript numeric enum to an array of string keys for use with z.enum().
 * This ensures that enum schemas generate string values rather than numeric values.
 * @param enumObject The TypeScript enum object
 * @returns Array of string keys from the enum
 */
export function getEnumKeys(enumObject) {
    return Object.keys(enumObject).filter((key) => isNaN(Number(key)));
}
/**
 * Safely converts a string enum key to its corresponding enum value.
 * Validates that the key exists in the enum before conversion.
 * @param enumObject The TypeScript enum object
 * @param key The string key to convert
 * @returns The enum value if key is valid, undefined otherwise
 */
export function safeEnumConvert(enumObject, key) {
    if (!key)
        return undefined;
    const validKeys = getEnumKeys(enumObject);
    if (!validKeys.includes(key)) {
        return undefined;
    }
    return enumObject[key];
}
