import { useEffect, useState } from "react";

import BookingForm from "./components/booking/BookingForm.jsx";
import MassageBookingForm from "./components/massage/MassageBookingForm.jsx";
import { getRestaurant } from "./api/bookingApi.js";

// ======================================================
// App
// ======================================================
//
// The business is identified by ?business=<slug>. The
// older ?restaurant=<slug> keeps working.
//
// Restaurants get the table booking form. Massage
// businesses get the massage booking form. The type comes
// from the public business information.
// ======================================================

function App() {
  const params = new URLSearchParams(window.location.search);

  const slug = params.get("business") || params.get("restaurant");

  const [business, setBusiness] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!slug) return undefined;

    let ignore = false;

    getRestaurant(slug)
      .then((data) => {
        if (!ignore) setBusiness(data);
      })
      .catch((error) => {
        console.error(error);

        if (!ignore) setFailed(true);
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  // Without a slug the restaurant form shows its own default
  // (as before).
  if (!slug) {
    return (
      <main>
        <BookingForm slug={slug} />
      </main>
    );
  }

  if (failed) {
    return (
      <main>
        <div className="booking-widget">
          <div className="booking-error" role="alert">
            Unable to load booking information.
          </div>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main>
        <div className="booking-widget">
          <div className="booking-loading">Loading booking...</div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {business.businessType === "MASSAGE" ? (
        <MassageBookingForm slug={slug} business={business} />
      ) : (
        <BookingForm slug={slug} />
      )}
    </main>
  );
}

export default App;
