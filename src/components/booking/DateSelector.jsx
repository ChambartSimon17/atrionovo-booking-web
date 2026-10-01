function DateSelector({ date, setDate }) {
  return (
    <div>
      <h3>Date</h3>

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />
    </div>
  );
}

export default DateSelector;
