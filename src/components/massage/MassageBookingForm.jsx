import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";

import {
  createMassageAppointment,
  getMassageAvailability,
  getMassageServices,
} from "../../api/massageBookingApi.js";

import { getTexts } from "./texts.js";
import "./massage.css";

// ======================================================
// Massage booking
// ======================================================
//
// Choose a massage (with duration and price), a day and one
// of the free times, then enter your details. The business
// assigns the therapist and the room; customers cannot
// choose them, but can leave a note.
// ======================================================

const BOOKING_HORIZON_DAYS = 90;

function formatPrice(priceCents, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "EUR",
  }).format(priceCents / 100);
}

function formatDateTime(isoString, timezone, locale) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function MassageBookingForm({ slug, business }) {
  const t = getTexts(business.language);

  const timezone = business.timezone;

  const { today, lastDate } = useMemo(() => {
    const now = DateTime.now().setZone(timezone);

    return {
      today: now.toISODate(),
      lastDate: now.plus({ days: BOOKING_HORIZON_DAYS }).toISODate(),
    };
  }, [timezone]);

  // Massages ------------------------------------------------

  const [servicesResult, setServicesResult] = useState(null);

  useEffect(() => {
    let ignore = false;

    getMassageServices(slug)
      .then((services) => {
        if (!ignore) setServicesResult({ services });
      })
      .catch((error) => {
        console.error(error);

        if (!ignore) setServicesResult({ services: [], failed: true });
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState(null);

  // Free times ----------------------------------------------
  //
  // The result is stored together with the request it belongs
  // to, so an answer to an older choice is never shown.

  const [reloadCount, setReloadCount] = useState(0);

  const slotsKey = serviceId ? `${serviceId}|${date}|${reloadCount}` : null;

  const [slotsResult, setSlotsResult] = useState(null);

  useEffect(() => {
    if (!slotsKey) return undefined;

    let ignore = false;

    getMassageAvailability(slug, { date, serviceId })
      .then((availability) => {
        if (!ignore) {
          setSlotsResult({ key: slotsKey, slots: availability.slots });
        }
      })
      .catch((error) => {
        console.error(error);

        if (!ignore) {
          setSlotsResult({ key: slotsKey, slots: [], failed: true });
        }
      });

    return () => {
      ignore = true;
    };
  }, [slotsKey, slug, date, serviceId]);

  const slotsReady = slotsKey !== null && slotsResult?.key === slotsKey;

  const loadingSlots = slotsKey !== null && !slotsReady;

  const slots = slotsReady ? slotsResult.slots : [];

  // Details and booking -------------------------------------

  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState("");

  function handleDetailsChange(event) {
    const { name, value } = event.target;

    setDetails((current) => ({ ...current, [name]: value }));
  }

  function chooseService(id) {
    setServiceId(id);
    setSlot(null);
    setError("");
  }

  function chooseDate(value) {
    setDate(value);
    setSlot(null);
    setError("");
  }

  async function handleSubmit() {
    // Prevent multiple submissions from the same browser.
    if (submitting) return;

    if (!serviceId || !slot) {
      setError(t.selectTime);
      return;
    }

    if (!details.firstName.trim()) {
      setError(t.enterFirstName);
      return;
    }

    if (!details.lastName.trim()) {
      setError(t.enterLastName);
      return;
    }

    if (!details.phoneNumber.trim()) {
      setError(t.enterPhone);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const created = await createMassageAppointment(slug, {
        massageServiceId: serviceId,
        startTime: slot.startTime,
        firstName: details.firstName.trim(),
        lastName: details.lastName.trim(),
        phoneNumber: details.phoneNumber.trim(),
        email: details.email.trim() || undefined,
        notes: details.notes.trim() || undefined,
      });

      setAppointment(created);
    } catch (submitError) {
      console.error(submitError);

      if (submitError.code === "APPOINTMENT_NOT_AVAILABLE") {
        // Somebody else took the time: show fresh free times.
        setSlot(null);
        setReloadCount((count) => count + 1);
        setError(t.slotTaken);
      } else if (submitError.code === "TOO_MANY_UPCOMING_APPOINTMENTS") {
        setError(t.tooMany);
      } else if (submitError.message === "Invalid phone number.") {
        setError(t.invalidPhone);
      } else {
        setError(t.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Screens -------------------------------------------------

  if (!servicesResult) {
    return (
      <div className="booking-widget">
        <div className="booking-loading">{t.loading}</div>
      </div>
    );
  }

  if (servicesResult.failed) {
    return (
      <div className="booking-widget">
        <div className="booking-error" role="alert">
          {t.loadError}
        </div>
      </div>
    );
  }

  const services = servicesResult.services;

  const selectedService = services.find((service) => service.id === serviceId);

  if (appointment) {
    return (
      <div className="booking-widget">
        <div className="confirmation">
          <div className="confirmation-icon">✓</div>

          <h1>{t.confirmedTitle}</h1>

          <p className="confirmation-message">{t.confirmedMessage}</p>

          <div className="confirmation-card">
            <div>
              <span>{t.labelMassage}</span>
              <strong>{appointment.serviceName}</strong>
            </div>

            <div>
              <span>{t.labelName}</span>
              <strong>
                {appointment.firstName} {appointment.lastName}
              </strong>
            </div>

            <div>
              <span>{t.labelDateTime}</span>
              <strong>
                {formatDateTime(appointment.startTime, timezone, t.locale)}
              </strong>
            </div>

            <div>
              <span>{t.labelDuration}</span>
              <strong>
                {appointment.durationMinutes} {t.minutes}
              </strong>
            </div>

            <div>
              <span>{t.labelPrice}</span>
              <strong>
                {formatPrice(
                  appointment.priceCents,
                  selectedService?.currency,
                  t.locale,
                )}
              </strong>
            </div>
          </div>

          <p className="confirmation-small">{t.thanks}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-widget">
      <div className="booking-header">
        <div className="booking-brand">AtrioNovo</div>

        <h1>{t.title}</h1>

        <p>{business.name}</p>
      </div>

      {error && (
        <div className="booking-error" role="alert">
          {error}
        </div>
      )}

      <div className="booking-section">
        <label>{t.chooseMassage}</label>

        {services.length === 0 && (
          <p className="massage-muted">{t.noServices}</p>
        )}

        <div className="massage-services">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              className={
                service.id === serviceId
                  ? "massage-service selected"
                  : "massage-service"
              }
              aria-pressed={service.id === serviceId}
              onClick={() => chooseService(service.id)}
            >
              <span className="massage-service-top">
                <strong>{service.name}</strong>

                <span className="massage-service-price">
                  {formatPrice(service.priceCents, service.currency, t.locale)}
                </span>
              </span>

              <span className="massage-service-meta">
                {service.durationMinutes} {t.minutes}
              </span>

              {service.description && (
                <span className="massage-service-description">
                  {service.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-section">
        <label htmlFor="massage-date">{t.date}</label>

        <input
          id="massage-date"
          type="date"
          value={date}
          min={today}
          max={lastDate}
          onChange={(event) => {
            if (event.target.value) chooseDate(event.target.value);
          }}
        />
      </div>

      <div className="booking-section">
        <label>{t.time}</label>

        {!serviceId ? (
          <p className="massage-muted">{t.chooseMassageFirst}</p>
        ) : loadingSlots ? (
          <p className="massage-muted">{t.loadingTimes}</p>
        ) : slotsResult?.failed ? (
          <p className="massage-muted">{t.timesError}</p>
        ) : slots.length === 0 ? (
          <p className="massage-muted">{t.noTimes}</p>
        ) : (
          <div className="massage-slots">
            {slots.map((candidate) => (
              <button
                key={candidate.startTime}
                type="button"
                className={
                  slot?.startTime === candidate.startTime
                    ? "massage-slot selected"
                    : "massage-slot"
                }
                aria-pressed={slot?.startTime === candidate.startTime}
                onClick={() => setSlot(candidate)}
              >
                {candidate.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {slot && (
        <div className="guest-details">
          <div className="section-heading">
            <h2>{t.yourDetails}</h2>
            <p>{t.detailsIntro}</p>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="firstName">{t.firstName}</label>

              <input
                id="firstName"
                type="text"
                name="firstName"
                value={details.firstName}
                onChange={handleDetailsChange}
                autoComplete="given-name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="lastName">{t.lastName}</label>

              <input
                id="lastName"
                type="text"
                name="lastName"
                value={details.lastName}
                onChange={handleDetailsChange}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="phoneNumber">{t.phone}</label>

            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={details.phoneNumber}
              onChange={handleDetailsChange}
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">
              {t.email} <span>{t.optional}</span>
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={details.email}
              onChange={handleDetailsChange}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="notes">
              {t.notes} <span>{t.optional}</span>
            </label>

            <textarea
              id="notes"
              name="notes"
              value={details.notes}
              onChange={handleDetailsChange}
              rows="3"
              maxLength={1000}
              placeholder={t.notesPlaceholder}
            />
          </div>

          <button
            className="booking-confirm-button"
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t.confirming : t.confirm}
          </button>

          <p className="secure-note">{t.secure}</p>
        </div>
      )}
    </div>
  );
}

export default MassageBookingForm;
