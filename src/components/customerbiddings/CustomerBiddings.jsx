// src/components/customerbiddings/CustomerBiddings.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './CustomerBiddings.css'; // Import the new CSS

function CustomerBiddings() {
    const location = useLocation();
    const navigate = useNavigate();
    // Get requestId from state passed during navigation
    const requestId = location.state?.requestId;
    const userId = localStorage.getItem("userId"); // Needed for accepting bid
    console.log("CustomerBiddings received requestId:", requestId); 

    const [bids, setBids] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [acceptingBidId, setAcceptingBidId] = useState(null); // State for loading indicator on button

    // Function to fetch bids
    const fetchBids = useCallback(async () => {
        if (!requestId) {
            setError("Request ID not found. Cannot fetch bids.");
            setIsLoading(false);
            return;
        }
        console.log(`Workspaceing bids for request ID: ${requestId}`);
        setError(null); // Clear previous errors

        try {
            // *** Use the GET /api/bids/:requestId endpoint ***
            const response = await fetch(`http://localhost:5005/api/bids/${requestId}`); // Ensure port 5002
            if (!response.ok) {
                throw new Error(`Failed to fetch bids (${response.status})`);
            }
            const data = await response.json();
            console.log("Fetched bids:", data);
            setBids(Array.isArray(data) ? data : []); // Ensure data is an array
        } catch (err) {
            console.error("Error fetching bids:", err);
            setError(err.message || "Could not load bids.");
            setBids([]); // Clear bids on error
        } finally {
            setIsLoading(false);
        }
    }, [requestId]); // Dependency on requestId

    // Fetch bids on component mount and when requestId changes
    useEffect(() => {
        setIsLoading(true); // Set loading true when starting fetch
        fetchBids();

        // Optional: Set up polling or Socket.IO listener here for real-time updates
        // Example polling:
        // const intervalId = setInterval(fetchBids, 10000); // Fetch every 10 seconds
        // return () => clearInterval(intervalId); // Cleanup interval

    }, [fetchBids]); // Depend on the memoized fetchBids function

    // Handler for accepting a bid
    const handleAcceptBid = async (bidId) => {
        if (!requestId || !userId || acceptingBidId) return; // Prevent double clicks

        setAcceptingBidId(bidId); // Show loading state for this button
        console.log(`Accepting bid ${bidId} for request ${requestId}`);

        try {
             // *** Use the POST /api/requests/select-bid endpoint ***
            const response = await fetch("http://localhost:5002/api/requests/select-bid", { // Ensure port 5002
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, bidId }), // Backend needs userId and bidId
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || `Failed to accept bid (${response.status})`);
            }

            toast.success("Bid accepted! Delivery is being arranged.");
            navigate(`/track-order/${requestId}`);

        } catch (err) {
            console.error("Error accepting bid:", err);
            toast.error(`Error: ${err.message}`);
            setAcceptingBidId(null); // Reset loading state on error
        }
         // No need to reset acceptingBidId on success if navigating away
    };

     // Handler for rejecting (optional)
     const handleRejectBid = (bidId) => {
         console.log(`Rejected bid ${bidId} (optional implementation)`);
         // Optionally filter out the bid visually or call a backend endpoint
         // setBids(prevBids => prevBids.filter(bid => bid._id !== bidId));
         toast.info("Bid rejected (visual only).");
     };


    // --- Render Logic ---

    // Handle missing requestId early
    if (!requestId && !isLoading) {
         return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: Request ID is missing. Please go back.</div>;
     }


    return (
        <div className="customer-biddings-page"> {/* Added root class */}


            {/* Rider search animation - Show when loading or no bids yet */}
            {(isLoading || bids.length === 0) && !error && (
                <section className="search-animation">
                    <div className="rider-loader">
                        <div className="rider-icon">🚴‍♂️</div>
                        <p>{isLoading ? "Searching for bids..." : "Waiting for delivery riders to bid..."}</p>
                    </div>
                </section>
            )}

            {/* Display error if any */}
             {error && <p style={{ color: 'red', textAlign: 'center', padding: '1rem' }}>Error loading bids: {error}</p>}


            {/* Rider Bids List - Show only if not loading and no error */}
            {!isLoading && !error && (
                <section className="requests">
                    <h2>📋 {bids.length > 0 ? "Riders Who Placed a Bid" : "No Bids Yet"}</h2>

                    {bids.map((bid, index) => {
                        // Safely access nested properties
                        const riderName = bid.deliveryPerson?.username || 'Unknown Rider';
                        const riderInitial = riderName.charAt(0).toUpperCase();

                        return (
                            <div className="request" key={bid._id} style={{animationDelay: `${index * 0.1}s`}}> {/* Stagger animation */}
                                <div className="info">
                                    <div className="avatar">{riderInitial}</div>
                                    <div>
                                        <div className="name">{riderName}</div>
                                        {/* Assuming bid object has 'price' */}
                                        <div className="offer">Offer: {bid.price} Rs</div>
                                        {/* Optionally display ETA if available: */}
                                        {/* {bid.eta && <div className="eta">ETA: {bid.eta}</div>} */}
                                    </div>
                                </div>
                                <div className="actions">
                                    <button
                                        className="accept"
                                        onClick={() => handleAcceptBid(bid._id)}
                                        disabled={acceptingBidId === bid._id} // Disable button while processing
                                    >
                                        {acceptingBidId === bid._id ? 'Accepting...' : 'Accept'}
                                    </button>
                                    {/* Optional Reject Button */}
                                    <button
                                        className="reject"
                                        onClick={() => handleRejectBid(bid._id)}
                                        disabled={acceptingBidId === bid._id} // Disable if accepting
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        );
                     })}
                </section>
            )}
        </div>
    );
}

export default CustomerBiddings;