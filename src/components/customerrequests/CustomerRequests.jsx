// src/components/customerrequests/CustomerRequests.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './CustomerRequests.css';

function CustomerRequests() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRestaurant = location.state?.selectedRestaurant;
  const userId = localStorage.getItem("userId");

  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedRestaurant) {
      toast.info("Please select a restaurant first.");
      navigate('/customer-dashboard');
    }
  }, [selectedRestaurant, navigate]);

  const handleDestinationChange = (e) => setDestination(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleBidAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*$/.test(value)) {
      setBidAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!destination.trim() || !description.trim() || !bidAmount || parseFloat(bidAmount) <= 0 || !userId || !selectedRestaurant) {
      toast.warn("Please fill all fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5005/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          pickup: selectedRestaurant.name,
          destination,
          description,
          customerPrice: parseFloat(bidAmount)
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Request failed");

      toast.success("Request submitted!");
      navigate('/customer-dashboard');
    } catch (err) {
      toast.error("Failed to submit request");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedRestaurant) {
    return <div>Loading...</div>;
  }

  return (
    <form className="customer-requests-page" onSubmit={handleSubmit}>
      <h1 className="headd">Place Delivery Request</h1>

      <div className="card">
        <h2>From <strong>{selectedRestaurant.name}</strong> Straight To You</h2>
        <p>Enter delivery details, item description, and the amount you're willing to pay.</p>

        <div className="input-container">
          <label htmlFor="destination" className="input-label">Delivery Destination (Dorm/Room):</label>
          <input
            className="text-input"
            type="text"
            id="destination"
            value={destination}
            onChange={handleDestinationChange}
            placeholder="e.g., Hostel C, Room 101"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="description" className="input-label">Item(s) Description:</label>
          <textarea
            className="textarea-input"
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="e.g., 1x Zinger Burger, 1x Large Fries"
            required
          />
        </div>

        <div className="input-container">
          <label htmlFor="amountInput" className="input-label">Enter Your Bid (Rs.):</label>
          <input
            className="amount-input-display"
            type="number"
            id="amountInput"
            value={bidAmount}
            onChange={handleBidAmountChange}
            placeholder="e.g., 150"
            required
          />
        </div>

        <button type="submit" className="submit-request-button" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      <div className="footer-info">
        Your request will be posted for delivery persons to see and bid on.
      </div>
    </form>
  );
}

export default CustomerRequests;
