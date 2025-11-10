import React from 'react';
import useListingMedia from '../hooks/useListingMedia';
import './listingCard.css';

const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') {
        return 'Price unavailable';
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

const ListingCard = ({ listing, onClick }) => {
    const mediaRefreshKey = `${listing?.title ?? ''}|${listing?.description ?? ''}|${listing?.price ?? ''}`;
    const { mediaUrl, isLoading } = useListingMedia(listing?.id, mediaRefreshKey);

    const handleClick = () => {
        if (typeof onClick === 'function') {
            onClick(listing);
        }
    };

    const subtitle = listing?.location || listing?.description || listing?.ownerEmail || '';

    return (
        <div className="listing-card" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick();
            }
        }}>
            <div className="listing-card__image-wrapper">
                {mediaUrl && !isLoading ? (
                    <img src={mediaUrl} alt={listing?.title || 'Listing'} className="listing-card__image" />
                ) : (
                    <div className="listing-card__placeholder">
                        {isLoading ? 'Loading...' : 'No image available'}
                    </div>
                )}
            </div>
            <div className="listing-card__info">
                <div className="listing-card__price">{formatPrice(listing?.price)}</div>
                <div className="listing-card__title">{listing?.title || 'Untitled listing'}</div>
                {subtitle && (
                    <div className="listing-card__subtitle">{subtitle}</div>
                )}
            </div>
        </div>
    );
};

export default ListingCard;

