import BookingForm from "./components/booking/BookingForm.jsx";

function App() {
  const params = new URLSearchParams(window.location.search);

  const restaurant = params.get("restaurant");

  return (
    <main>
      <BookingForm slug={restaurant} />
    </main>
  );
}

export default App;
