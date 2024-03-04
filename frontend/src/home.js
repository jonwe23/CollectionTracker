import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import searchIcon from './searchIcon.svg';
import './home.css';

function Home() {
    const [credentials, setCredentials] = useState({ 
        username: '', 
        password: '' 
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = () => {
        alert(`Log in with Username: ${credentials.username} and Password: ${credentials.password}`);
    };

    return (
        <div className="Home">
            <header className="header">
                <div className="title-section">
                    <h1>CollectionTracker</h1>
                </div>
                <div className="user-login">
                    <input
                        type="text"
                        placeholder="Email"
                        name="username"
                        value={credentials.username}
                        onChange={handleInputChange}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={credentials.password}
                        onChange={handleInputChange}
                    />
                    <button onClick={handleLogin}>Log In</button>
                    <button className="register-button">
                        <Link to="/register" className="register-link">Register</Link>
                    </button>
                </div>
            </header>
            <main className="main-content">
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <h2>Marketplace</h2>
                    </div>
                    <div className="sidebar-section search-bar">
                        <div className="search-bar">
                            <input type="text" placeholder="Search Marketplace" className="search-input" />
                            <img src={searchIcon} className="search-icon" alt="Search Icon" />
                        </div>
                    </div>
                </aside>
                <section id="listings">
                    <h2>Listings</h2>
                </section>
            </main>
        </div>
    );
}

export default Home;