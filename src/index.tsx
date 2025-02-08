import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import StarRating from "./StarRating";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
      defaultRating={3}
    />
    <StarRating maxRating={10} color="cyan" size={32} /> */}
  </React.StrictMode>
);
