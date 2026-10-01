function formatDateTime(isoString, timezone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function BookingConfirmation({ reservation, timezone }) {
  return (
    <div className="confirmation">
      <div className="confirmation-icon">✓</div>

      <h1>Reservation confirmed</h1>

      <p className="confirmation-message">
        Your table has been successfully reserved.
      </p>

      <div className="confirmation-card">
        <div>
          <span>Restaurant</span>
          <strong>{reservation.restaurant?.name}</strong>
        </div>

        <div>
          <span>Name</span>
          <strong>
            {reservation.firstName} {reservation.lastName}
          </strong>
        </div>

        <div>
          <span>Guests</span>
          <strong>{reservation.guestCount}</strong>
        </div>

        <div>
          <span>Date & time</span>
          <strong>{formatDateTime(reservation.startTime, timezone)}</strong>
        </div>
      </div>

      <p className="confirmation-small">Thank you for your reservation.</p>
    </div>
  );
}

export default BookingConfirmation;
