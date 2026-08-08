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

// A plan-limit error (code PLAN_LIMIT_REACHED) carries structured details —
// { resource, limit, current, plan, upgradeTo } — instead of a plain message,
// so the UI can show an upgrade prompt instead of a generic error toast.
// Returns null for any other kind of error.
export const getPlanLimitDetails = (err) => {
  const data = err?.response?.data;
  if (data?.code !== 'PLAN_LIMIT_REACHED') return null;
  return { message: data.message, ...data.details };
};

export default extractErrorMessage;
