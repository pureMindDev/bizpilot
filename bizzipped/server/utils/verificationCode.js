export const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Password-reset codes reuse the same 6-digit format but are tracked separately
// from email-verification codes so the two flows can't be mixed up.
export const PASSWORD_RESET_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export default generateVerificationCode;
