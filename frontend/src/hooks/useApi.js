// hooks/useApi.js
// Thin wrapper that gives every API call:
//   - loading state
//   - automatic toast on success / error
//   - optional redirect after success
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/**
 * @param {Function} apiFn   — the async function that returns an axios response
 * @param {Object}  options
 *   successMessage  {string}   — if set, show a success toast with this text
 *                                (pass `true` to use the server's res.data.message)
 *   errorMessage    {string}   — override the error toast text
 *   onSuccess       {Function} — callback(responseData) after success
 *   redirectTo      {string}   — navigate here after success
 *   showErrorToast  {boolean}  — default true; set false to silence the error toast
 */
export function useApi(apiFn, options = {}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      try {
        const res = await apiFn(...args);
        const data = res?.data ?? res;

        // Success toast
        if (options.successMessage) {
          const msg =
            options.successMessage === true
              ? data?.message || "Done!"
              : options.successMessage;
          toast.success(msg);
        }

        // Callback
        if (options.onSuccess) options.onSuccess(data);

        // Redirect
        if (options.redirectTo) navigate(options.redirectTo);

        return { success: true, data };
      } catch (err) {
        const msg = options.errorMessage || err.message;
        if (options.showErrorToast !== false) toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiFn],
  );

  return { execute, loading };
}
