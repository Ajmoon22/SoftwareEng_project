// src/components/customerrequests/CustomerRequests.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './CustomerRequests.css'; // Import the CSS for this component

// Import banner image if needed

function CustomerRequests() {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedRestaurant = location.state?.selectedRestaurant; // Get data passed from dashboard
    const userId = localStorage.getItem("userId");

    // State variables combining original form and new bid input
    const [destination, setDestination] = useState(''); // Renamed from 'dorm'
    const [description, setDescription] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Redirect if no restaurant data ---
    useEffect(() => {
        if (!selectedRestaurant) {
            console.warn("No selected restaurant found in state, redirecting to dashboard.");
            toast.info("Please select a restaurant first.");
            navigate('/customer-dashboard');
        }
    }, [selectedRestaurant, navigate]);

    // --- Input Handlers ---
    const handleDestinationChange = (event) => setDestination(event.target.value);
    const handleDescriptionChange = (event) => setDescription(event.target.value);
    const handleBidAmountChange = (event) => {
        const value = event.target.value;
        if (value === '' || /^[0-9]*$/.test(value)) { // Allow only numbers
            setBidAmount(value);
        }
    };

    // --- Form Submission ---
    // --- Form Submission ---
    const handleSubmit = async (event) => {
      event.preventDefault();
      // ... (Keep all validations: destination, description, bidAmount, etc.) ...
       if (!destination.trim() || !description.trim() || !bidAmount || parseFloat(bidAmount) <= 0 || !userId || !selectedRestaurant) {
           toast.warn("Please fill all fields correctly.");
           return;
       }

      setIsSubmitting(true);
      const pickupLocation = selectedRestaurant.name;

      try {
          // *** Verify your backend is running on port 5002 (or change if needed) ***
          const response = await fetch('http://localhost:5005/api/requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  user: userId,
                  pickup: pickupLocation,
                  destination: destination,
                  description: description,
                  initialBid: parseFloat(bidAmount), // Ensure backend handles this
                  restaurantId: selectedRestaurant.id, // Ensure backend handles this
                  restaurantName: selectedRestaurant.name // Ensure backend handles this
              }),
          });

          const data = await response.json(); // Parse the JSON response from backend

          if (!response.ok) {
              // Handle non-2xx responses using backend message if available
              throw new Error(data.msg || `Request failed (${response.status})`);
          }

          // --- CORRECTED CHECK ---
          // Check for '_id' directly on the 'data' object
          if (data?._id) {
              toast.success(`Request submitted! Now viewing bids...`);
              // Navigate using the received ID
              navigate('/customer-dashboard');
            } else {
               // This error should now only happen if backend sends success status but no '_id'
               console.error("Backend Response Data:", data); // Log data for debugging
               throw new Error("Request created, but valid ID not found in backend response.");
          }
          // --- END CORRECTION ---

      } catch (error) {
          console.error("Error submitting request:", error);
          toast.error(`Error: ${error.message}`);
          setIsSubmitting(false); // Allow retry on error
      }
       // Don't set isSubmitting false on success if navigating away
  };

    // Avoid rendering if data isn't ready
    if (!selectedRestaurant) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    // --- Render the new UI ---
    return (
        // Use form tag for semantic structure and onSubmit handling
        <form className="customer-requests-page" onSubmit={handleSubmit}>

                <h1 className='headd'>Place Delivery Request</h1>



            <div className="card">
                <h2>From <strong>{selectedRestaurant.name}</strong> Straight To You</h2>
                <p>
                    Enter delivery details, item description, and the amount you're willing to pay.
                </p>

                {/* Destination Input */}
                 <div className="input-container">
                     <label htmlFor="destination" className="input-label">
                         Delivery Destination (Dorm/Room):
                     </label>
                     <input
                        className="text-input"
                        type="text"
                        id="destination"
                        name="destination"
                        value={destination}
                        onChange={handleDestinationChange}
                        placeholder="e.g., Hostel C, Room 101"
                        required
                     />
                 </div>

                 {/* Description Input */}
                 <div className="input-container">
                      <label htmlFor="description" className="input-label">
                          Item(s) Description:
                      </label>
                      <textarea
                          className="textarea-input"
                          id="description"
                          name="description"
                          value={description}
                          onChange={handleDescriptionChange}
                          placeholder="e.g., 1x Zinger Burger, 1x Large Fries"
                          required
                          rows={3} // Adjust rows as needed
                      />
                 </div>

                 {/* Bid Amount Input */}
                 <div className="input-container">
                    <label htmlFor="amountInput" className="input-label">Enter Your Bid (Rs.):</label>
                    <input
                        className="amount-input-display"
                        type="number"
                        inputMode="numeric"
                        id="amountInput"
                        name="bidAmount"
                        placeholder="Enter amount"
                        value={bidAmount}
                        onChange={handleBidAmountChange}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit" // Important: Set type to submit for form handling
                    className="submit-request-button" // Use a specific class
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>

            </div>

            {/* Removed the keyboard div */}

            <div className="footer-info">
                 Your request will be posted for delivery persons to see and bid on.
            </div>
        </form>
    );
}

export default CustomerRequests;