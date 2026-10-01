(function () {
  const script = document.currentScript;

  if (!script) {
    console.error("AtrioNovo Booking Widget: Could not find widget script.");
    return;
  }

  const restaurant = script.dataset.restaurant;

  if (!restaurant) {
    console.error(
      "AtrioNovo Booking Widget: Missing data-restaurant attribute."
    );
    return;
  }

  // -----------------------------
  // Create floating button
  // -----------------------------

  const button = document.createElement("button");

  button.textContent = "Reserveer";

  Object.assign(button.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    zIndex: "999998",
    border: "none",
    borderRadius: "12px",
    padding: "16px 28px",
    background: "#e5aa32",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "Arial, sans-serif",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  });

  document.body.appendChild(button);

  // -----------------------------
  // Create overlay
  // -----------------------------

  const overlay = document.createElement("div");

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.35)",
    zIndex: "999999",
    display: "none",
  });

  document.body.appendChild(overlay);

  // -----------------------------
  // Create booking panel
  // -----------------------------

  const panel = document.createElement("div");

  Object.assign(panel.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "420px",
    maxWidth: "calc(100vw - 32px)",
    height: "720px",
    maxHeight: "calc(100vh - 48px)",
    background: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    zIndex: "1000000",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    display: "none",
  });

  document.body.appendChild(panel);

  // -----------------------------
  // Close button
  // -----------------------------

  const closeButton = document.createElement("button");

  closeButton.textContent = "×";

  Object.assign(closeButton.style, {
    position: "absolute",
    top: "10px",
    right: "12px",
    zIndex: "2",
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
    color: "#111",
    fontSize: "26px",
    lineHeight: "1",
    cursor: "pointer",
  });

  panel.appendChild(closeButton);

  // -----------------------------
  // Booking iframe
  // -----------------------------

  const iframe = document.createElement("iframe");

  iframe.src =
    `http://localhost:5173/?restaurant=${encodeURIComponent(
      restaurant
    )}`;

  iframe.title = "Restaurant booking";
  iframe.loading = "lazy";

  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "0",
    display: "block",
  });

  panel.appendChild(iframe);

  // -----------------------------
  // Open
  // -----------------------------

  button.addEventListener("click", function () {
    panel.style.display = "block";
    overlay.style.display = "block";
    button.style.display = "none";
  });

  // -----------------------------
  // Close
  // -----------------------------

  function closeWidget() {
    panel.style.display = "none";
    overlay.style.display = "none";
    button.style.display = "block";
  }

  closeButton.addEventListener("click", closeWidget);

  overlay.addEventListener("click", closeWidget);
})();