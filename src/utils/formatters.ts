/**
 * Formats an enum-like string (e.g., "IN_PROGRESS" -> "In Progress")
 */
export const formatEnum = (value: string | undefined): string => {
    if (!value) return '';
    return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formats a status to Sentence Case (e.g., "AVAILABLE" -> "Available")
 */
export const formatStatusCase = (status: string): string => {
    return formatEnum(status);
};
