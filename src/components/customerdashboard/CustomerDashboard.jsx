// src/components/customerdashboard/CustomerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import './CustomerDashboard.css';

import tacoImage from '../../assets/taco.jpg';
import grilledImage from '../../assets/grilled.jpg';
import burgerImage from '../../assets/burger.jpg';
import pizzaImage from '../../assets/pizza.jpg';
import biryaniImage from '../../assets/biryani.jpg';
import curryImage from '../../assets/curry.jpg';
import sushiImage from '../../assets/sushi.jpg';
import pastaImage from '../../assets/pasta.jpg';

const socket = io("http://localhost:5005");

const restaurants = [
  { id: 1, name: 'Jammin Java', rating: 4.5, time: '20-25 min', price: '', tags: ['Mexican', 'Snacks', 'Drinks'], image: tacoImage },
  { id: 2, name: 'Zakir Tikka', rating: 4.7, time: '15-20 min', price: '', tags: ['BBQ', 'Pakistani', 'Spicy'], image: grilledImage },
  { id: 3, name: 'Baradari', rating: 4.2, time: '10-15 min', price: '', tags: ['Burgers', 'Fast Food', 'Drinks'], image: burgerImage },
  { id: 4, name: 'Delish', rating: 4.6, time: '20-30 min', price: '', tags: ['Pizza', 'Cheesy', 'Italian'], image: pizzaImage },
  { id: 5, name: 'Mastani', rating: 4.8, time: '25-30 min', price: '', tags: ['Biryani', 'Desi', 'Spicy'], image: biryaniImage },
  { id: 6, name: 'Juice zone', rating: 4.3, time: '20-25 min', price: '', tags: ['Chinese', 'Noodles', 'Dumplings'], image: curryImage },
  { id: 7, name: 'Super Store', rating: 4.1, time: '10-15 min', price: '', tags: ['Coffee', 'Cafe', 'Bakery'], image: tacoImage },
  { id: 8, name: 'Green Olive', rating: 4.4, time: '15-20 min', price: '', tags: ['Healthy', 'Salads', 'Vegan'], image: grilledImage },
  { id: 9, name: 'Khokha Store', rating: 4.6, time: '5-10 min', price: '', tags: ['Ice Cream', 'Dessert', 'Cold'], image: sushiImage },
  { id: 10, name: 'Bunker', rating: 4.5, time: '20-25 min', price: '', tags: ['Italian', 'Pasta', 'Cheesy'], image: pastaImage },
];

function RestaurantCard({ restaurant, onClick }) {
  return (
    <div className="customer-dashboard-card" onClick={() => onClick(restaurant)}>
      <img src={restaurant.image} alt={restaurant.name} />
      <div className="customer-dashboard-card-body">
        <div className="customer-dashboard-card-title">{restaurant.name}</div>
        <div className="customer-dashboard-card-sub">⭐ {restaurant.rating} · {restaurant.time} · {restaurant.price}</div>
        <div className="customer-dashboard-tags">
          {restaurant.tags.map((tag) => (
            <div key={tag} className="customer-dashboard-tag">{tag}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [activeRequest, setActiveRequest] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingBidId, setAcceptingBidId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [rating, setRating] = useState(0);

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5005/api/requests/user/${userId}`);
      const data = await res.json();
      const request = data.find(r => r.status !== "completed" && r.status !== "canceled");
      setActiveRequest(request || null);

      if (request && request._id) {
        const bidRes = await fetch(`http://localhost:5005/api/bids/${request._id}`);
        const bidData = await bidRes.json();
        setBids(bidData || []);
      }
    } catch (err) {
      console.error("Failed to fetch request or bids", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleAcceptBid = async (bidId) => {
    if (!activeRequest || acceptingBidId) return;
    setAcceptingBidId(bidId);
    try {
      const res = await fetch("http://localhost:5005/api/requests/select-bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bidId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      toast.success("Bid accepted!");
      setActiveRequest(data);
    } catch (err) {
      toast.error("Failed to accept bid");
    } finally {
      setAcceptingBidId(null);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequest?._id) return;
    try {
      const res = await fetch(`http://localhost:5005/api/requests/${activeRequest._id}/cancel`, {
        method: "PATCH"
      });
      if (!res.ok) throw new Error("Failed to cancel request.");
      toast.info("Request cancelled.");
      setActiveRequest(null);
      navigate("/customer-dashboard");
    } catch (err) {
      toast.error("Error cancelling request.");
    }
  };

  const handleRestaurantClick = (restaurant) => {
    navigate('/customer-requests', { state: { selectedRestaurant: restaurant } });
  };

  const handleRate = async () => {
    if (!activeRequest?.assignedDeliveryPerson?._id || rating < 1) return;
    try {
      const res = await fetch("http://localhost:5005/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryPersonId: activeRequest.assignedDeliveryPerson._id,
          customerId: userId,
          rating: rating
        })
      });
      if (!res.ok) throw new Error("Rating failed");
      toast.success("Thanks for your feedback!");
      setActiveRequest(null);
      setRating(0);
      setShowRatingPrompt(false);
    } catch (err) {
      toast.error("Could not rate delivery");
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  useEffect(() => {
    socket.on("bid_placed", ({ requestId, bid }) => {
      if (activeRequest && requestId === activeRequest._id) {
        setBids(prev => [...prev, bid]);
      }
    });

    socket.on("request_status_updated", (updated) => {
      if (updated.user === userId) {
        if (updated.status === "completed") {
          setShowRatingPrompt(true);
        }
        setActiveRequest(updated);
      }
    });

    socket.on("request_canceled", ({ requestId }) => {
      if (activeRequest?._id === requestId) {
        setActiveRequest(null);
        toast.info("Request canceled.");
      }
    });

    return () => {
      socket.off("bid_placed");
      socket.off("request_status_updated");
      socket.off("request_canceled");
    };
  }, [activeRequest, userId]);

  if (loading) return <div>Loading...</div>;

  if (showRatingPrompt && activeRequest?.assignedDeliveryPerson) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>🎉 Delivery Completed!</Typography>
        <Typography variant="body1">Rate your delivery person: <strong>{activeRequest.assignedDeliveryPerson.username}</strong></Typography>
        <Rating
          name="delivery-rating"
          value={rating}
          precision={1}
          onChange={(event, newValue) => setRating(newValue)}
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleRate} disabled={rating < 1}>
            Submit Rating
          </Button>
          <Button sx={{ ml: 2 }} onClick={() => {
            setShowRatingPrompt(false);
            setActiveRequest(null);
          }}>
            Skip
          </Button>
        </Box>
      </Box>
    );
  }

  if (activeRequest?.selectedBid) {
    return (
      <div className="customer-biddings-page">
        <h2>🚚 Delivery In Progress</h2>
        <p><strong>Assigned to:</strong> {activeRequest.assignedDeliveryPerson?.username || "Loading..."}</p>
        <p><strong>Phone:</strong> {activeRequest.assignedDeliveryPerson?.phone || "Not Available"}</p>
        <p><strong>Offer:</strong> {activeRequest.selectedBid?.price || "—"} Rs</p>
        <p><strong>ETA:</strong> {activeRequest.selectedBid?.eta || "—"}</p>
        <p><strong>Status:</strong> {activeRequest.status}</p>
      </div>
    );
  }

  if (activeRequest) {
    return (
      <div className="customer-biddings-page">
        <h2>🛵 Active Delivery Request</h2>
        {bids.length === 0 ? (
          <p>Waiting for riders to bid...</p>
        ) : (
          bids.map((bid) => (
            <div className="request" key={bid._id}>
              <div className="info">
                <div className="avatar">{bid.deliveryPerson?.username?.charAt(0) || "?"}</div>
                <div>
                  <div className="name">{bid.deliveryPerson?.username || "Anonymous"}</div>
                  <div className="offer">Offer: {bid.price} Rs</div>
                  {bid.eta && <div className="eta">ETA: {bid.eta}</div>}
                  {bid.deliveryPerson?.rating && (
                    <div className="rating">
                      <Rating value={parseFloat(bid.deliveryPerson.rating)} readOnly precision={0.1} size="small" />
                      ({bid.deliveryPerson.rating}/5)
                    </div>
                  )}
                </div>
              </div>
              <div className="actions">
                <button onClick={() => handleAcceptBid(bid._id)} disabled={acceptingBidId === bid._id}>
                  {acceptingBidId === bid._id ? "Accepting..." : "Accept"}
                </button>
              </div>
            </div>
          ))
        )}
        <Button onClick={handleCancelRequest} color="error" variant="outlined" sx={{ mt: 2 }}>
          Cancel Request
        </Button>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-container">
      <header className="customer-dashboard-header">
        <div className="customer-dashboard-logo">Campus Cart</div>
      </header>

      <div className="customer-dashboard-welcome-text">
        <h1>Welcome!</h1>
        <p>Your campus, your delivery, your way</p>
      </div>

      <div className="past-deliveries-button-wrapper">
        <button className="past-deliveries-button" onClick={() => navigate("/past-deliveries")}>
          📜 View Past Deliveries
        </button>
      </div>

      <div className="customer-dashboard-search-container">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="customer-dashboard-restaurant-list">
        {restaurants
          .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((r) => (
            <RestaurantCard key={r.id} restaurant={r} onClick={handleRestaurantClick} />
          ))}
      </div>
    </div>
  );
}

export default CustomerDashboard;
