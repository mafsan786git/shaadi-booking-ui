export const validateMobile = (phone: string): boolean => {
    // strict 10 digits, starts with 1-9 (no leading 0)
    const regex = /^[1-9]\d{9}$/;
    return regex.test(phone);
};

export const sanitizeMobileInput = (value: string): string => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
};
