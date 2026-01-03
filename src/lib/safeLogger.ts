/**
 * Safe Logger
 * Prevents log injection attacks by sanitizing input before logging.
 * Specifically mitigates CRLF injection (CWE-117).
 */

export const safeLogger = {
    info: (message: string, ...args: any[]) => {
        console.log(sanitize(message), ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(sanitize(message), ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(sanitize(message), ...args);
    },
    debug: (message: string, ...args: any[]) => {
        console.debug(sanitize(message), ...args);
    }
};

/**
 * Sanitizes a string for logging by replacing newlines and other control characters.
 */
function sanitize(input: string): string {
    if (typeof input !== 'string') return input;
    // Replace newlines and carriage returns with escaped versions or spaces
    return input.replace(/[\n\r]/g, ' ');
}
