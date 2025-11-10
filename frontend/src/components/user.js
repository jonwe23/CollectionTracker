import React, { useState, useEffect } from 'react';
import './user.css';
import profileIcon from '../icons/profileIcon.webp';
import searchIcon from '../icons/searchIcon.svg';
import arrowIcon from '../icons/arrowIcon.png';
import { fetchUserListings } from '../services/api'; 
import PreviewBox from './previewBox';
import ListingCard from './ListingCard';

function User() {
    const [listings, setListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        price: '',
        description: '',
        mediaFile: null,
        mediaPreviewUrl: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaRefreshToken, setMediaRefreshToken] = useState(0);

    const resetEditForm = () => {
        if (editForm.mediaPreviewUrl) {
            URL.revokeObjectURL(editForm.mediaPreviewUrl);
        }
        setEditForm({
            title: '',
            price: '',
            description: '',
            mediaFile: null,
            mediaPreviewUrl: null
        });
        setIsEditing(false);
    };

    useEffect(() => {
        const loadListings = async () => {
            const email = localStorage.getItem('email');

            if (!email) {
                setListings([]);
                return;
            }

            try {
                const listingsFromServer = await fetchUserListings(email);
                setListings(listingsFromServer);
            } catch (error) {
                console.error('Unable to load user listings', error);
                setListings([]);
            }
        };
        loadListings();
    }, []);

    const handleListingClick = (listing) => {
        resetEditForm();
        setSelectedListing(listing);
        setShowPreviewModal(true);
    };

    const handleCloseModal = () => {
        setShowProfileModal(false);
        setShowPreviewModal(false);
        resetEditForm();
    };

    const handleCreateListingClick = () => {
        window.location.href = "/createListing";
    };

    const handleGoToHomePage = () => {
        window.location.href = "/";
    };

    const startEdit = () => {
        if (!selectedListing) {
            return;
        }

        resetEditForm();
        setEditForm({
            title: selectedListing.title || '',
            price: selectedListing.price !== undefined && selectedListing.price !== null
                ? String(selectedListing.price)
                : '',
            description: selectedListing.description || '',
            mediaFile: null,
            mediaPreviewUrl: null
        });
        setIsEditing(true);
    };

    const handleEditFieldChange = (event) => {
        const { name, value } = event.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditMediaChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith('image')) {
            alert('Please select an image file.');
            return;
        }
        if (editForm.mediaPreviewUrl) {
            URL.revokeObjectURL(editForm.mediaPreviewUrl);
        }
        const previewUrl = URL.createObjectURL(file);
        setEditForm(prev => ({
            ...prev,
            mediaFile: file,
            mediaPreviewUrl: previewUrl
        }));
    };

    const handleRemoveNewMedia = () => {
        if (editForm.mediaPreviewUrl) {
            URL.revokeObjectURL(editForm.mediaPreviewUrl);
        }
        setEditForm(prev => ({
            ...prev,
            mediaFile: null,
            mediaPreviewUrl: null
        }));
    };

    const handleDeleteListing = async () => {
        if (!selectedListing) {
            return;
        }
        const email = localStorage.getItem('email');
        if (!email) {
            alert('You need to be logged in to delete a listing.');
            return;
        }
        const confirmDelete = window.confirm('Are you sure you want to delete this listing?');
        if (!confirmDelete) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/listings/${selectedListing.id}?ownerEmail=${encodeURIComponent(email)}`, {
                method: 'DELETE'
            });
            if (!response.ok && response.status !== 204) {
                const message = await response.text();
                throw new Error(message || 'Failed to delete listing');
            }
            setListings(prev => prev.filter(listing => listing.id !== selectedListing.id));
            setShowPreviewModal(false);
            setSelectedListing(null);
            resetEditForm();
            setMediaRefreshToken(prev => prev + 1);
            alert('Listing deleted successfully.');
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert(error.message || 'Failed to delete listing.');
        }
    };

    const handleSubmitEdit = async (event) => {
        event.preventDefault();
        if (!selectedListing) {
            return;
        }

        const email = localStorage.getItem('email');
        if (!email) {
            alert('You need to be logged in to edit a listing.');
            return;
        }

        if (!editForm.title || !editForm.price || !editForm.description) {
            alert('Please provide a title, price, and description.');
            return;
        }

        const parsedPrice = Number(editForm.price);
        if (Number.isNaN(parsedPrice)) {
            alert('Price must be a valid number.');
            return;
        }

        setIsSubmitting(true);
        try {
            const updateResponse = await fetch(`http://localhost:8080/listings/${selectedListing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editForm.title,
                    price: parsedPrice,
                    description: editForm.description,
                    ownerEmail: email
                })
            });

            if (!updateResponse.ok) {
                const message = await updateResponse.text();
                throw new Error(message || 'Failed to update listing.');
            }

            const updatedListing = await updateResponse.json();

            if (editForm.mediaFile) {
                const mediaFormData = new FormData();
                mediaFormData.append('id', updatedListing.id);
                mediaFormData.append('media', editForm.mediaFile);

                const mediaResponse = await fetch('http://localhost:8080/media', {
                    method: 'POST',
                    body: mediaFormData
                });

                if (!mediaResponse.ok) {
                    throw new Error('Listing updated, but failed to upload new media.');
                }
                setMediaRefreshToken(prev => prev + 1);
            }

            setListings(prev => prev.map(listing => (
                listing.id === updatedListing.id ? updatedListing : listing
            )));
            setSelectedListing(updatedListing);
            resetEditForm();
            alert('Listing updated successfully.');
        } catch (error) {
            console.error('Error updating listing:', error);
            alert(error.message || 'Failed to update listing.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="User">
            <header className="header">
                <div className="title-section">
                    <h1>CollectionTracker</h1>
                </div>
            </header>
            <main className="main-content">
                <aside className="sidebar-user">
                    <div className="sidebar-section">
                        <button className="go-back-button" onClick={handleGoToHomePage}>
                            <img src={arrowIcon} className="arrow-icon" alt="Arrow Icon" />
                        </button>
                        <h2>Marketplace</h2>
                    </div>
                    <div className="create-listing">
                        <button className="create-listing-button" onClick={handleCreateListingClick}>
                            + Create New Listing
                        </button>
                        <div className="user-actions">
                            <div className="your-marketplace">
                                <button className="your-marketplace-button" onClick={() => setShowProfileModal(true)}>
                                    <img src={profileIcon} className="profile-icon" alt="Profile Icon" />
                                    Marketplace Profile
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="manage-listings">
                        <button className="manage-listings-button">
                            Manage Listings
                        </button>
                    </div>
                </aside>
                <section id="listings">
                    <div className="sidebar3-section">
                        <h2>Your Listings</h2>
                    </div>
                    <div className="listings-container">
                        <div className="search-bar-user">
                            <input type="text" placeholder="Search listings" className="search-input" />
                            <img src={searchIcon} className="search-icon" alt="Search Icon" />
                        </div>
                    </div>
                    <div className="listing-grid">
                        {listings.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onClick={handleListingClick}
                            />
                        ))}
                        {listings.length === 0 && (
                            <div className="listing-empty-state">
                                You have no listings yet.
                            </div>
                        )}
                    </div>
                </section>
                
            </main>

            {showProfileModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <span className="close-modal" onClick={handleCloseModal}>×</span>
                        <h2>Marketplace Profile</h2>
                    </div>
                </div>
            )}

            {showPreviewModal && selectedListing && (
                <div className="modal-overlay">
                    <div className="modal">
                        <span className="close-modal" onClick={handleCloseModal}>×</span>
                        <PreviewBox listing={selectedListing} mediaRefreshKey={mediaRefreshToken} />
                        {!isEditing ? (
                            <div className="listing-modal-actions">
                                <button className="listing-action-button" onClick={startEdit}>
                                    Edit Listing
                                </button>
                                <button className="listing-action-button danger" onClick={handleDeleteListing}>
                                    Delete Listing
                                </button>
                            </div>
                        ) : (
                            <form className="edit-listing-form" onSubmit={handleSubmitEdit}>
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleEditFieldChange}
                                />

                                <label>Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={editForm.price}
                                    onChange={handleEditFieldChange}
                                />

                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditFieldChange}
                                />

                                <label htmlFor="edit-media-input">Photo</label>
                                <div className="edit-listing-media-preview">
                                    {editForm.mediaPreviewUrl ? (
                                        <img src={editForm.mediaPreviewUrl} alt="Preview upload" />
                                    ) : (
                                        <span>No new photo selected. Current photo will remain.</span>
                                    )}
                                </div>
                                <input
                                    id="edit-media-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditMediaChange}
                                />
                                {editForm.mediaFile && (
                                    <button type="button" className="edit-listing-remove-media" onClick={handleRemoveNewMedia}>
                                        Remove new photo
                                    </button>
                                )}
                                <small className="edit-listing-note">Leave empty to keep the current photo.</small>

                                <div className="edit-listing-form-actions">
                                    <button type="button" className="listing-action-button secondary" onClick={resetEditForm}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="listing-action-button primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default User;
