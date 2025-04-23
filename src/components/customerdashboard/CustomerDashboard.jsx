import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';

// --- Image Imports ---
import tacoImage from '../../assets/taco.jpg';
import grilledImage from '../../assets/grilled.jpg';
import burgerImage from '../../assets/burger.jpg';
import pizzaImage from '../../assets/pizza.jpg';
import biryaniImage from '../../assets/biryani.jpg';
import curryImage from '../../assets/curry.jpg';
import sushiImage from '../../assets/sushi.jpg';
import pastaImage from '../../assets/pasta.jpg';

// --- Restaurant Data ---
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRestaurantClick = (restaurant) => {
      console.log("Restaurant clicked:", restaurant.name);
      navigate('/customer-requests', { state: { selectedRestaurant: restaurant } });
  };

  const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
  };

  return (
    <div className="customer-dashboard-container">
        {/* Header */}
        <header className="customer-dashboard-header">
            <div className="customer-dashboard-logo">Campus Cart</div>
            <div className="customer-dashboard-nav-icons">
                <span>🔔</span>
                <span>⚙️</span>
                <span>🚪</span>
            </div>
        </header>

        {/* Search Container */}
        <div className="customer-dashboard-search-container">
            <input 
                type="text" 
                placeholder="Search restaurants..." 
                value={searchQuery} 
                onChange={handleSearchChange}
            />
        </div>

        {/* Welcome Text */}
        <div className="customer-dashboard-welcome-text">
            <h1>Welcome!</h1>
            <p>Your campus, your delivery, your way</p>
        </div>

        {/* Restaurant List */}
        <div className="customer-dashboard-restaurant-list">
            {restaurants.filter((resto) => resto.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((resto) => (
                    <RestaurantCard
                        key={resto.id}
                        restaurant={resto}
                        onClick={handleRestaurantClick}
                    />
                ))}
        </div>
    </div>
  );
}

export default CustomerDashboard;
