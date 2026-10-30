const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ======================================================
// Massage booking API
// ======================================================
//
// Public endpoints for massage businesses. The server
// answers { success, data } or { success: false, message,
// code }. Errors keep the server's code and HTTP status so
// the screen can react to them (for example a time that was
// taken in the meantime).
// ======================================================

async function request(path, options) {
  const response = await fetch(
    `${API_BASE_URL}/public/booking/${path}`,
    options,
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    // Not JSON (for example a gateway error).
  }

  if (!response.ok || !result?.success) {
    const error = new Error(result?.message || "Request failed");

    error.status = response.status;
    error.code = result?.code ?? null;

    throw error;
  }

  return result.data;
}

export function getMassageServices(slug) {
  return request(`${encodeURIComponent(slug)}/massage-services`);
}

export function getMassageAvailability(slug, { date, serviceId }) {
  const query = new URLSearchParams({ date, serviceId });

  return request(
    `${encodeURIComponent(slug)}/massage-availability?${query}`,
  );
}

export function createMassageAppointment(slug, appointment) {
  return request(`${encodeURIComponent(slug)}/massage-appointments`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(appointment),
  });
}
