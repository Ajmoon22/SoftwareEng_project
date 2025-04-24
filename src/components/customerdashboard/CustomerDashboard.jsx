import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Keep this import
import './CustomerDashboard.css';
import { FiSettings, FiLogOut } from 'react-icons/fi';

// --- Image Imports ---
import tacoImage from '../../assets/taco.jpg';
import grilledImage from '../../assets/grilled.jpg';
import burgerImage from '../../assets/burger.jpg';
import pizzaImage from '../../assets/pizza.jpg';
import biryaniImage from '../../assets/biryani.jpg';
import curryImage from '../../assets/curry.jpg';
import sushiImage from '../../assets/sushi.jpg';
import pastaImage from '../../assets/pasta.jpg';

// --- Restaurant Data --
const restaurants = [
    { id: 1, name: 'Jammin Java', rating: 4.5, time: '20-25 min', price: '₹', tags: ['Mexican', 'Snacks', 'Drinks'], image: tacoImage },
    { id: 2, name: 'Zakir Tikka', rating: 4.7, time: '15-20 min', price: '₹₹', tags: ['BBQ', 'Pakistani', 'Spicy'], image: grilledImage },
    { id: 3, name: 'Baradari', rating: 4.2, time: '10-15 min', price: '₹', tags: ['Burgers', 'Fast Food', 'Drinks'], image: burgerImage },
    { id: 4, name: 'Delish', rating: 4.6, time: '20-30 min', price: '₹₹', tags: ['Pizza', 'Cheesy', 'Italian'], image: pizzaImage },
    { id: 5, name: 'Mastani', rating: 4.8, time: '25-30 min', price: '₹₹₹', tags: ['Biryani', 'Desi', 'Spicy'], image: biryaniImage },
    { id: 6, name: 'Juice zone', rating: 4.3, time: '20-25 min', price: '₹₹', tags: ['Chinese', 'Noodles', 'Dumplings'], image: curryImage },
    { id: 7, name: 'Super Store', rating: 4.1, time: '10-15 min', price: '₹', tags: ['Coffee', 'Cafe', 'Bakery'], image: tacoImage },
    { id: 8, name: 'Green Olive', rating: 4.4, time: '15-20 min', price: '₹₹', tags: ['Healthy', 'Salads', 'Vegan'], image: grilledImage },
    { id: 9, name: 'Khokha Store', rating: 4.6, time: '5-10 min', price: '₹', tags: ['Ice Cream', 'Dessert', 'Cold'], image: sushiImage },
    { id: 10, name: 'Bunker', rating: 4.5, time: '20-25 min', price: '₹₹', tags: ['Italian', 'Pasta', 'Cheesy'], image: pastaImage },
];

// Restaurant Card Component
// *** Removed handleSettingsClick from here - it doesn't belong in the card ***
function RestaurantCard({ restaurant, onClick }) {
    
    return (
        <div
            className="customer-dashboard-card"
            onClick={() => onClick(restaurant)}
            style={{ cursor: 'pointer' }}
        >
            <img src={restaurant.image} alt={restaurant.name} />
            <div className="customer-dashboard-card-body">
                <div className="customer-dashboard-card-title">{restaurant.name}</div>
                <div className="customer-dashboard-card-sub">
                    ⭐ {restaurant.rating} · {restaurant.time} · {restaurant.price}
                </div>
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
    const navigate = useNavigate(); // *** Define navigate here using the hook ***
    const [searchQuery, setSearchQuery] = useState('');

    // --- Define handlers within the CustomerDashboard component ---

    // Function to handle Settings navigation
    const handleSettingsClick = () => {
        console.log("Navigating to Settings...");
        navigate("/settings"); // Now navigate is defined in this scope
    };

    // Function to handle Logout
    const handleLogoutClick = () => {
        console.log("Logging out...");
        // Optional: Clear user data from localStorage if needed
        // localStorage.removeItem("username");
        // localStorage.removeItem("role");
        navigate("/login"); // Navigate to Login page
    };

    // Function to handle clicking on a restaurant card
    const handleRestaurantClick = (restaurant) => {
        console.log("Restaurant clicked:", restaurant.name);
        navigate('/customer-requests', { state: { selectedRestaurant: restaurant } });
    };

    // Function to handle changes in the search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    

    // --- Component Render ---
    return (
        <div className="customer-dashboard-container">
            {/* Header */}
            <div className="customer-dashboard-header">
                <div className="customer-dashboard-logo">
                    Campus Cart
                </div>
                <nav className="customer-dashboard-nav">
                    {/* *** These onClick handlers now refer to functions defined above *** */}
                    <button className="nav-button" onClick={handleSettingsClick} aria-label="Settings">
                        <FiSettings className="nav-icon" />
                        <span>Settings</span>
                    </button>
                    <button className="nav-button" onClick={handleLogoutClick} aria-label="Logout">
                        <FiLogOut className="nav-icon" />
                        <span>Logout</span>
                    </button>
                </nav>
            </div>


            {/* Welcome Text */}
            {/* Welcome Text & Bidding Button */}
            <div className="customer-dashboard-welcome-container"> {/* New container for Flexbox */}
                <div className="customer-dashboard-welcome-text">
                    <h1>Welcome!</h1>
                    <p>Your campus, your delivery, your way</p>
                </div>
            </div>
            {/* Restaurant List */}
            <div className="customer-dashboard-restaurant-list">
                {restaurants.filter((resto) =>
                        resto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        resto.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) // Optional: Also search tags
                    )
                    .map((resto) => (
                        <RestaurantCard
                            key={resto.id}
                            restaurant={resto}
                            onClick={handleRestaurantClick} // Correct handler passed here
                        />
                    ))}
            </div>
        </div>
    );
}

export default CustomerDashboard;