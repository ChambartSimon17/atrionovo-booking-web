function GuestDetailsForm({
  guestDetails,
  setGuestDetails,
  onSubmit,
  submitting,
}) {
  function handleChange(event) {
    const { name, value } = event.target;

    setGuestDetails((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <div className="guest-details">
      <div className="section-heading">
        <h2>Your details</h2>
        <p>We'll use these details for your reservation.</p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="firstName">First name</label>

          <input
            id="firstName"
            type="text"
            name="firstName"
            value={guestDetails.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="lastName">Last name</label>

          <input
            id="lastName"
            type="text"
            name="lastName"
            value={guestDetails.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="phoneNumber">Phone number</label>

        <input
          id="phoneNumber"
          type="tel"
          name="phoneNumber"
          value={guestDetails.phoneNumber}
          onChange={handleChange}
          autoComplete="tel"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="email">
          Email <span>(optional)</span>
        </label>

        <input
          id="email"
          type="email"
          name="email"
          value={guestDetails.email}
          onChange={handleChange}
          autoComplete="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="notes">
          Notes <span>(optional)</span>
        </label>

        <textarea
          id="notes"
          name="notes"
          value={guestDetails.notes}
          onChange={handleChange}
          rows="3"
          placeholder="Allergies, special requests..."
        />
      </div>

      <button
        className="booking-confirm-button"
        type="button"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? "Confirming reservation..." : "Confirm reservation"}
      </button>

      <p className="secure-note">
        Your reservation is securely processed by AtrioNovo.
      </p>
    </div>
  );
}

export default GuestDetailsForm;
