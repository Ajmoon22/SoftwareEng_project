// src/components/deliverydashboard/DeliveryDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./DeliveryDashboard.css"; // Ensure CSS is linked and complete
import BidModal from "./BidModal"; // Import the (styled) BidModal
import { io } from "socket.io-client";
import { toast } from "react-toastify";

// Socket connection
const socket = io("http://localhost:5002"); // Verify URL/port

export default function DeliveryDashboard() {
    // --- State Variables ---
    const [requests, setRequests] = useState([]); // Holds all requests fetched
    const [isLoading, setIsLoading] = useState(true); // Loading state for fetch
    const [showModal, setShowModal] = useState(false); // Controls bid modal visibility
    const [modalRequest, setModalRequest] = useState(null); // Holds data for the modal
    const [justUpdatedId, setJustUpdatedId] = useState(null); // Track recently updated status to avoid double toasts

    // Get logged-in delivery person's ID
    const deliveryPersonId = localStorage.getItem("userId");

    // --- Data Fetching ---
    const fetchRequests = useCallback(async () => {
        if (!deliveryPersonId) {
            console.error("Delivery Person ID not found in localStorage.");
            setIsLoading(false);
            toast.error("Could not identify delivery person.");
            return;
        }
        // Don't reset isLoading to true here if called by socket, only on initial/refresh
        // setIsLoading(true);
        console.log("Fetching requests...");
        try {
            // Fetch assigned and available requests relevant to this driver
            const res = await fetch(`http://localhost:5005/api/requests/active?deliveryPersonId=${deliveryPersonId}`);
            if (!res.ok) {
                 const errorData = await res.json().catch(()=>({})); // Try get error msg
                 throw new Error(errorData.msg || `Failed to fetch requests (${res.status})`);
            }
            const data = await res.json();
            console.log("Fetched requests data:", data);
            setRequests(Array.isArray(data) ? data : []); // Ensure data is always an array
        } catch (err) {
            console.error("Failed to fetch requests", err);
            toast.error(err.message || "Could not load delivery requests.");
            setRequests([]); // Reset to empty array on error
        } finally {
            // Only set loading false after the *initial* fetch completes
            // Subsequent fetches (from sockets) might not need to show global loading
             if (isLoading) setIsLoading(false);
        }
    }, [deliveryPersonId, isLoading]); // Include isLoading in dependencies

    // --- Effect for Initial Fetch and Socket Listeners ---
    useEffect(() => {
        if (!deliveryPersonId) return; // Don't run effect if ID is missing

        fetchRequests(); // Initial fetch on mount

        // Generic handler to trigger a refetch for various events
        const handleRefetch = (eventData) => {
            console.log("Socket event received, triggering refetch. Data:", eventData);
            fetchRequests();
        };

        // Specific handler for status updates (to manage toasts)
        const handleStatusUpdate = (updatedRequest) => {
            console.log('Status update received via socket:', updatedRequest);
            const isAssignedToMe = requests.some(req =>
                req._id === updatedRequest._id &&
                req.assignedDeliveryPerson === deliveryPersonId
            );
            // Only toast if it's assigned to me AND not the one I just updated via button click
            if (isAssignedToMe && updatedRequest._id !== justUpdatedId) {
                toast.info(`📍 Status updated for request ending in ${updatedRequest._id.slice(-6)}`);
            }
            fetchRequests(); // Refetch to update UI
        };

        // Subscribe to socket events
        socket.on("new_request", handleRefetch);
        socket.on("bid_accepted", handleRefetch);
        socket.on("request_canceled", handleRefetch);
        socket.on("request_status_updated", handleStatusUpdate);
        socket.on('bid_placed', handleRefetch); // Listen for new bids being placed

        // Cleanup listeners on component unmount
        return () => {
            socket.off("new_request", handleRefetch);
            socket.off("bid_accepted", handleRefetch);
            socket.off("request_canceled", handleRefetch);
            socket.off("request_status_updated", handleStatusUpdate);
            socket.off('bid_placed', handleRefetch);
        };
        // Dependencies: only fetchRequests (which depends on deliveryPersonId)
        // Avoid adding 'requests' or 'justUpdatedId' here to prevent potential loops
    }, [fetchRequests, deliveryPersonId]);

    // --- Modal Handlers ---
    const openModalForRequest = (request) => {
        setModalRequest(request);
        setShowModal(true);
    };
    const closeModal = () => {
        setModalRequest(null);
        setShowModal(false);
        // Optionally refetch after closing modal (if a bid was placed)
        // The 'bid_placed' socket event should handle this now.
        // fetchRequests();
    };

    // --- Status Update Logic ---
    const updateStatus = async (requestId, newStatus) => {
        // Don't set isLoading globally, maybe indicate on the specific card?
        // setIsLoading(true);
         setJustUpdatedId(requestId); // Mark this ID as being updated by me
         setTimeout(() => setJustUpdatedId(null), 3000); // Reset after 3s

        try {
            const res = await fetch(`http://localhost:5002/api/requests/${requestId}/status`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success("✅ Status updated successfully!");
                // Let the socket listener handle the fetchRequests call
            } else {
                 const errorData = await res.json().catch(() => ({}));
                 toast.error(errorData.msg || `❌ Failed to update status (${res.status})`);
                 // setIsLoading(false); // Reset loading if needed
            }
        } catch (err) {
            toast.error("🚨 Network error updating status");
             // setIsLoading(false); // Reset loading if needed
        }
    };

    // --- Filtering Requests ---
    const assignedRequests = requests.filter(
        (req) => req.assignedDeliveryPerson === deliveryPersonId && req.status !== 'completed' && req.status !== 'canceled'
    );
    const availableRequests = requests.filter((req) => !req.selectedBid && (req.status === 'pending' || req.status === 'active')); // Show pending/active as available

    // --- Status Button Logic ---
    const getNextStatusButton = (req) => {
        switch (req.status?.toLowerCase()) {
            case "confirmed":
                return <button className="status-button pickup" onClick={() => updateStatus(req._id, "picked up")}>Mark as Picked Up</button>;
            case "picked up":
                return <button className="status-button transit" onClick={() => updateStatus(req._id, "on the way")}>Mark as On The Way</button>;
            case "on the way":
                return <button className="status-button complete" onClick={() => updateStatus(req._id, "completed")}>Mark as Delivered</button>;
            default:
                 // Display status text if no action available or if completed/cancelled
                return <span className="status-text">({req.status || 'Unknown'})</span>;
        }
    };

    // --- Component Render ---
    return (
        <div className="delivery-dashboard-page">
            <header className="header">
                <h1>📦 Delivery Dashboard</h1>
                <p>Manage your assigned deliveries and find new offers!</p>
            </header>

            <div className="refresh-container">
                <button onClick={fetchRequests} disabled={isLoading} className="refresh-button">
                    {isLoading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>

            {/* == Assigned Deliveries Section == */}
            <section className="assigned-deliveries">
                <h2> Your Assigned Deliveries</h2>
                {isLoading && assignedRequests.length === 0 && <p>Loading assigned deliveries...</p>}
                {!isLoading && assignedRequests.length === 0 && <p>No deliveries currently assigned to you.</p>}

                {assignedRequests.length > 0 && (
                    <div className="assigned-list">
                        {assignedRequests.map((req) => (
                            <div className="assigned-card" key={req._id}>
                                <h4>{req.pickup || 'N/A'} → {req.destination || 'N/A'}</h4>
                                <p className="description"><strong>Desc:</strong> {req.description || "N/A"}</p>
                                <p className="status-line">
                                    <strong>Status:</strong>
                                    <span className={`status-tag status-${req.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}`}>
                                        {req.status || 'Unknown'}
                                    </span>
                                </p>
                                <div className="status-actions">
                                    {getNextStatusButton(req)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            {/* ============================== */}

            {/* Available Offers Section */}
            <section className="offers">
                <h2>📢 Available Delivery Offers</h2>
                {isLoading && availableRequests.length === 0 && <p>Loading available offers...</p>}
                {!isLoading && availableRequests.length === 0 && <p>No available delivery offers right now.</p>}

                {availableRequests.length > 0 && (
                     <div className="offer-list">
                         {availableRequests.map((req) => (
                             <div className="offer-card" key={req._id}>
                                 <h3>{req.pickup || 'N/A'} → {req.destination || 'N/A'}</h3>
                                 {/* Display initial bid placed by customer if available */}
                                 {req.initialBid && <p className="initial-bid">Customer Bid: <strong>{req.initialBid} Rs</strong></p>}
                                 <p>{req.description || "No description provided."}</p>
                                 <button onClick={() => openModalForRequest(req)}>
                                     Place Your Bid
                                 </button>
                             </div>
                         ))}
                     </div>
                 )}
            </section>

            {/* Render the Bid Modal */}
            {showModal && modalRequest && (
                <BidModal
                    request={modalRequest}
                    deliveryPersonId={deliveryPersonId}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}