// src/components/deliverydashboard/BidModal.jsx
import React, { useState } from "react";
import "./BidModal.css"; // Link to the new CSS
import { toast } from "react-toastify";

export default function BidModal({ request, deliveryPersonId, onClose }) {
    const [price, setPrice] = useState("");
    const [eta, setEta] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitBid = async () => {
        // Basic validation
        if (!price || !eta) {
            toast.warn("Please enter both price and ETA"); return;
        }
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            toast.warn("Please enter a valid positive price."); return;
        }
        if (!request?._id || !deliveryPersonId) {
            toast.error("Error: Missing request or user information."); return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:5005/api/bids`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId: request._id,
                    deliveryPerson: deliveryPersonId,
                    price: parseFloat(price),
                    eta
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Bid submitted successfully!");
                onClose(); // Close the modal
            } else {
                toast.error(data.msg || `Error submitting bid (${res.status})`);
            }
        } catch (err) {
            console.error("Submit bid network/parsing error:", err);
            toast.error("An error occurred while submitting the bid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!request) return null; // Don't render if request is missing

    return (
        // Modal Backdrop
        <div className="bid-modal-backdrop" onClick={onClose}> {/* Close on backdrop click */}
            {/* Modal Content - Stop propagation so click inside doesn't close */}
            <div className="bid-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                
                {/* Request Info Summary */}
                <div className="bid-modal-request-info">
                    <span>Request:</span> {request.pickup || 'N/A'} → {request.destination || 'N/A'}
                </div>

                 {/* Form Fields */}
                 <div className="bid-modal-form">
                     <div className="form-group">
                        <label htmlFor={`bid-price-${request._id}`}>Your Price Offer (Rs):</label>
                        <input
                            id={`bid-price-${request._id}`}
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g., 100"
                        />
                     </div>
                     <div className="form-group">
                         <label htmlFor={`bid-eta-${request._id}`}>Estimated Time (ETA):</label>
                         <input
                             id={`bid-eta-${request._id}`}
                             type="text"
                             value={eta}
                             onChange={(e) => setEta(e.target.value)}
                             placeholder="e.g., 15-20 minutes"
                         />
                     </div>
                 </div>

                {/* Modal Action Buttons */}
                <div className="bid-modal-actions">
                    <button className="submit-bid-btn" onClick={submitBid} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                    </button>
                    <button className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}