// src/components/ordertracking/OrderTrackingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import './OrderTrackingPage.css'; // Import the CSS for this page

// Connect to socket server (ensure URL/port is correct)
const socket = io("http://localhost:5005");

function OrderTrackingPage() {
    const { requestId } = useParams(); // Get requestId from URL parameter
    const navigate = useNavigate();

    const [requestDetails, setRequestDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoized fetch function
    const fetchRequestDetails = useCallback(async () => {
        if (!requestId) {
            setError("Request ID is missing from URL.");
            setIsLoading(false);
            return;
        }
        setError(null);
        console.log(`Workspaceing details for request: ${requestId}`);
        try {
            const response = await fetch(`http://localhost:5002/api/requests/${requestId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch request details (${response.status})`);
            }
            const data = await response.json();
            console.log("Fetched Request Details:", data);
            setRequestDetails(data);
        } catch (err) {
            console.error("Error fetching request details:", err);
            setError(err.message || "Could not load request details.");
            setRequestDetails(null);
        } finally {
            setIsLoading(false);
        }
    }, [requestId]);

    // Initial fetch and Socket.IO setup
    useEffect(() => {
        setIsLoading(true);
        fetchRequestDetails();

        // Socket listener for status updates
        const handleStatusUpdate = (updatedRequest) => {
            console.log("Socket received request_status_updated:", updatedRequest);
            // Check if the update is for the request we are currently viewing
            if (updatedRequest?._id === requestId) {
                console.log("Updating status for current request:", updatedRequest.status);
                toast.info(`Order status updated to: ${updatedRequest.status}`);
                // Update local state - merge if necessary or just replace
                setRequestDetails(prevDetails => ({
                    ...prevDetails,
                    ...updatedRequest // Overwrite with new details from socket
                }));
                // Or specifically update status if that's all that changes:
                // setRequestDetails(prevDetails => ({ ...prevDetails, status: updatedRequest.status }));
            }
        };

        // Listen for the event emitted by the backend
        socket.on("request_status_updated", handleStatusUpdate);

        // Cleanup listener on component unmount
        return () => {
            console.log("Cleaning up OrderTrackingPage socket listener");
            socket.off("request_status_updated", handleStatusUpdate);
        };

    }, [fetchRequestDetails, requestId]); // Dependencies

    // --- Helper function to get status display ---
    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return { text: 'Confirmed (Waiting for Pickup)', color: '#6c757d', bgColor: '#e9ecef', animation: 'none' }; // Greyish
            case 'picked up': return { text: 'Picked Up', color: '#0056b3', bgColor: '#cce0ff', animation: 'none' }; // Blueish
            case 'on the way': return { text: 'In Transit', color: '#665c00', bgColor: '#ffe066', animation: 'blink 2s infinite' }; // Yellow blinking (as per CSS)
            case 'delivered': // Fall-through intentional
            case 'completed': return { text: 'Delivered / Completed', color: '#155724', bgColor: '#d4edda', animation: 'none' }; // Greenish
            case 'canceled': return { text: 'Canceled', color: '#721c24', bgColor: '#f8d7da', animation: 'none' }; // Reddish
            default: return { text: status || 'Unknown', color: '#383d41', bgColor: '#e2e3e5', animation: 'none' }; // Default grey
        }
    };

    // --- Render Loading/Error/Data ---
    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading order details...</div>;
    }
    if (error) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
    }
    if (!requestDetails) {
         return <div style={{ padding: '2rem', textAlign: 'center' }}>Order details not found.</div>;
    }

    // Get display info for the current status
    const currentStatusInfo = getStatusInfo(requestDetails.status);

    return (
        <div className="order-tracking-page"> {/* Add root class */}


            {/* Animation Section - could be conditional based on status */}
            {requestDetails.status !== 'completed' && requestDetails.status !== 'delivered' && (
                <section className="delivery-animation">
                    <div className="delivery-loader">
                        <div className="delivery-icon">📦➡️🏠</div>
                        <p>Waiting for delivery updates...</p>
                    </div>
                </section>
            )}

            {/* Order Receipt Section */}
            <section className="receipt">
                <h2>Delivery Details</h2>
                <div className="receipt-info">
                    <div className="info-item">
                        <strong>Driver Name:</strong>
                        {/* Access populated username */}
                        <span>{requestDetails.assignedDeliveryPerson?.username || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <strong>Delivery Fee:</strong>
                        {/* Access populated bid price */}
                        <span>{requestDetails.selectedBid?.price !== undefined ? `${requestDetails.selectedBid.price} Rs` : 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <strong>Pickup Location:</strong>
                        <span>{requestDetails.pickup || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <strong>Drop Location:</strong>
                        <span>{requestDetails.destination || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <strong>Order ID:</strong>
                        {/* Displaying MongoDB ID - consider a shorter/friendlier ID if available */}
                        <span>#{requestDetails._id?.slice(-8) || 'N/A'}</span>
                    </div>
                </div>
                 {/* Status Display with dynamic styling */}
                <div
                    className="status"
                    style={{
                        backgroundColor: currentStatusInfo.bgColor,
                        color: currentStatusInfo.color,
                        animation: currentStatusInfo.animation
                    }}
                >
                    Status: {currentStatusInfo.text}
                </div>
            </section>
        </div>
    );
}

export default OrderTrackingPage;