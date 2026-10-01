function GuestSelector({ guestCount, setGuestCount, maxReservationSize }) {
  const options = Array.from(
    { length: maxReservationSize },
    (_, index) => index + 1,
  );

  return (
    <div>
      <h3>Guests</h3>

      <select
        value={guestCount}
        onChange={(event) => setGuestCount(Number(event.target.value))}
      >
        {options.map((count) => (
          <option key={count} value={count}>
            {count} {count === 1 ? "guest" : "guests"}
          </option>
        ))}
      </select>
    </div>
  );
}

export default GuestSelector;
