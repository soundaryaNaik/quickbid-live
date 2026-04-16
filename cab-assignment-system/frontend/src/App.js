import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [driverName, setDriverName] = useState("");
  const [driverLocation, setDriverLocation] = useState("");

  const [userLocation, setUserLocation] = useState("");

  const [result, setResult] = useState(null);

  // Add driver
  const addDriver = async () => {
    try {
      const res = await axios.post("http://localhost:5000/drivers", {
        name: driverName,
        location: Number(driverLocation),
      });

      alert(res.data.message);
      setDriverName("");
      setDriverLocation("");
    } catch (err) {
      console.log(err);
      alert("Error adding driver");
    }
  };

  // Request ride
  const requestRide = async () => {
    try {
      const res = await axios.post("http://localhost:5000/ride", {
        user_location: Number(userLocation),
      });

      setResult(res.data);
    } catch (err) {
      console.log(err);
      alert("Error requesting ride");
    }
  };

  return (
    <div className="container">
      <h1>🚖 Cab Assignment System</h1>

      {/* ADD DRIVER */}
      <div className="card">
        <h2>Add Driver</h2>

        <input
          placeholder="Driver Name"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
        />

        <input
          placeholder="Driver Location (number)"
          value={driverLocation}
          onChange={(e) => setDriverLocation(e.target.value)}
        />

        <button onClick={addDriver}>Add Driver</button>
      </div>

      {/* REQUEST RIDE */}
      <div className="card">
        <h2>Request Ride</h2>

        <input
          placeholder="Your Location (number)"
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
        />

        <button onClick={requestRide}>Find Nearest Driver</button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="result">
          <h2>🚕 Ride Result</h2>

          <p>
            <b>Message:</b> {result.message}
          </p>

          {result.driver && (
            <>
              <p>
                <b>Driver Name:</b> {result.driver.name}
              </p>
              <p>
                <b>Driver Location:</b> {result.driver.location}
              </p>
              <p>
                <b>Distance:</b> {result.distance}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;