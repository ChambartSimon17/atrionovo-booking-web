import { useEffect, useState } from "react";

import {
  getRestaurant,
  checkAvailability,
  createReservation,
} from "../../api/bookingApi.js";

import GuestSelector from "./GuestSelector.jsx";
import DateSelector from "./DateSelector.jsx";
import TimeSelector from "./TimeSelector.jsx";
import GuestDetailsForm from "./GuestDetailsForm.jsx";
import BookingConfirmation from "./BookingConfirmation.jsx";

function formatDate(isoString, timezone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoString));
}

function formatTime(isoString, timezone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function BookingForm({ slug = "refter2" }) {
  const [restaurant, setRestaurant] = useState(null);

  const [guestCount, setGuestCount] = useState(2);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const data = await getRestaurant(slug);

        setRestaurant(data);
        setGuestCount(Math.min(2, data.maxReservationSize));
      } catch (error) {
        console.error(error);
        setError("Unable to load booking information.");
      }
    }

    loadRestaurant();
  }, [slug]);

  async function handleCheckAvailability() {
    if (checkingAvailability) return;

    if (!date || !time || !guestCount) {
      setError("Please select a date, time and number of guests.");
      return;
    }

    setCheckingAvailability(true);
    setAvailability(null);
    setError("");

    try {
      const result = await checkAvailability(slug, {
        guestCount,
        date,
        time,
      });

      setAvailability(result);
    } catch (error) {
      console.error(error);
      setError("Unable to check availability. Please try again.");
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function handleSubmit() {
    // VERY IMPORTANT:
    // Prevent multiple submissions from the same browser.
    if (submitting) return;

    if (!date || !time) {
      setError("Please select a date and time.");
      return;
    }

    if (!availability?.available) {
      setError("This time is no longer available.");
      return;
    }

    if (!guestDetails.firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!guestDetails.lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!guestDetails.phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const createdReservation = await createReservation(slug, {
        firstName: guestDetails.firstName.trim(),
        lastName: guestDetails.lastName.trim(),
        phoneNumber: guestDetails.phoneNumber.trim(),
        email: guestDetails.email.trim() || undefined,
        guestCount,
        date,
        time,
        notes: guestDetails.notes.trim() || undefined,
      });

      setReservation(createdReservation);
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "This time may no longer be available. Please choose another time.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!restaurant) {
    return (
      <div className="booking-widget">
        <div className="booking-loading">Loading booking...</div>
      </div>
    );
  }

  if (reservation) {
    return (
      <div className="booking-widget">
        <BookingConfirmation
          reservation={reservation}
          timezone={restaurant.timezone}
        />
      </div>
    );
  }

  return (
    <div className="booking-widget">
      <div className="booking-header">
        <div className="booking-brand">AtrioNovo</div>

        <h1>Book a table</h1>

        <p>{restaurant.name}</p>
      </div>

      {error && (
        <div className="booking-error" role="alert">
          {error}
        </div>
      )}

      <div className="booking-section">
        <GuestSelector
          guestCount={guestCount}
          setGuestCount={(value) => {
            setGuestCount(value);
            setAvailability(null);
          }}
          maxReservationSize={restaurant.maxReservationSize}
        />
      </div>

      <div className="booking-section">
        <DateSelector
          date={date}
          setDate={(value) => {
            setDate(value);
            setTime("");
            setAvailability(null);
          }}
        />
      </div>

      <div className="booking-section">
        <TimeSelector
          time={time}
          setTime={(value) => {
            setTime(value);
            setAvailability(null);
          }}
          loading={checkingAvailability}
        />
      </div>

      <button
        className="booking-primary-button"
        type="button"
        onClick={handleCheckAvailability}
        disabled={!date || !time || !guestCount || checkingAvailability}
      >
        {checkingAvailability
          ? "Checking availability..."
          : "Check availability"}
      </button>

      {availability?.available && (
        <div className="availability-card">
          <div className="availability-icon">✓</div>

          <div>
            <strong>Your table is available</strong>

            <p>
              {formatDate(
                availability.requestedSlot.startTime,
                restaurant.timezone,
              )}
            </p>

            <p>
              {formatTime(
                availability.requestedSlot.startTime,
                restaurant.timezone,
              )}{" "}
              · {guestCount} {guestCount === 1 ? "guest" : "guests"}
            </p>
          </div>
        </div>
      )}

      {availability?.available && (
        <GuestDetailsForm
          guestDetails={guestDetails}
          setGuestDetails={setGuestDetails}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {availability && !availability.available && (
        <div className="unavailable-card">
          <strong>This time isn't available</strong>

          {availability.alternativeSlots?.length > 0 && (
            <>
              <p>Try one of these times:</p>

              <div className="alternative-slots">
                {availability.alternativeSlots.map((slot) => (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => {
                      const alternativeDate = new Date(slot.startTime);

                      setDate(alternativeDate.toLocaleDateString("en-CA"));

                      setTime(
                        alternativeDate.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      );

                      setAvailability(null);
                    }}
                  >
                    {new Date(slot.startTime).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingForm;
