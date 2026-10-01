function TimeSelector({ time, setTime, loading }) {
  return (
    <div>
      <label>Time</label>

      <br />

      <input
        type="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
        disabled={loading}
      />
    </div>
  );
}

export default TimeSelector;
