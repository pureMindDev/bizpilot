// Pulls a readable message out of the backend's error response shape:
// { success: false, message, details?: [{ field, message }] | string[] }
export const extractErrorMessage = (err) => {
  const data = err?.response?.data;
  if (!data) return err?.message || 'Something went wrong. Please check your connection and try again.';

  if (Array.isArray(data.details) && data.details.length > 0) {
    const first = data.details[0];
    return typeof first === 'string' ? first : first.message || data.message;
  }

  return data.message || 'Something went wrong. Please try again.';
};

export default extractErrorMessage;
