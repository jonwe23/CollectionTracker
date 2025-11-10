import React from 'react';
import useListingMedia from '../hooks/useListingMedia';
import './previewBox.css';

const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') {
        return '';
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
        return price;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(numericPrice);
};

const PreviewBox = ({ listing, onRemoveMedia, mediaRefreshKey = 0 }) => {
    const listingId = listing?.id;
    const { mediaUrl } = useListingMedia(listingId, mediaRefreshKey);

    if (!listing) return null;

    return (
        <div className="listing-preview">
            <div className="listing-preview__media">
                {mediaUrl ? (
                    <img src={mediaUrl} alt={listing.title || 'Listing'} className="listing-preview__image" />
                ) : (
                    <div className="listing-preview__placeholder">
                        No image available
                    </div>
                )}
                {mediaUrl && onRemoveMedia && (
                    <button className="listing-preview__remove" onClick={onRemoveMedia}>Remove</button>
                )}
            </div>
            <div className="listing-preview__details">
                {listing.title && <h1 className="listing-preview__title">{listing.title}</h1>}
                {formatPrice(listing.price) && (
                    <div className="listing-preview__price">{formatPrice(listing.price)}</div>
                )}

                <section className="listing-preview__section">
                    <h2>Details</h2>
                    <p>{listing.description || 'Description will appear here.'}</p>
                </section>

                {listing.ownerEmail && (
                    <section className="listing-preview__section">
                        <h2>Seller information</h2>
                        <p>{listing.ownerEmail}</p>
                    </section>
                )}
            </div>
        </div>
    );
};

export default PreviewBox;
