const API_BASE_URL = "http://localhost:3000";

export async function getRestaurant(slug) {
  const response = await fetch(
    `${API_BASE_URL}/public/booking/${slug}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load restaurant");
  }

  const result = await response.json();

  return result.data;
}

export async function checkAvailability(
  slug,
  { guestCount, date, time },
) {
  const response = await fetch(
    `${API_BASE_URL}/public/booking/${slug}/availability`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        guestCount,
        date,
        time,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to check availability");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Failed to check availability",
    );
  }

  return result.data;
}

export async function createReservation(
  slug,
  reservation,
) {
  const response = await fetch(
    `${API_BASE_URL}/public/booking/${slug}/reservation`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(reservation),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create reservation");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Failed to create reservation",
    );
  }

  return result.data;
}