import React from 'react';
import useListingMedia from '../hooks/useListingMedia';

const PreviewBox = ({ listing, onRemoveMedia }) => {
    const listingId = listing?.id;
    const { mediaUrl } = useListingMedia(listingId);

    if (!listing) return null;

    return (
        <div className="preview-container">
            {mediaUrl && (
                <div className="media-preview">
                    <img src={mediaUrl} alt={listing.title || 'Listing'} className="media-item" />
                    {onRemoveMedia && (
                        <button className="remove-button" onClick={onRemoveMedia}>Remove</button>
                    )}
                </div>
            )}
            <div className="details-preview">
                <h3>{listing.title || 'Title'}</h3>
                <p>{listing.price ? `$${listing.price}` : 'Price'}</p>
                <h3>Details</h3>
                <p>{listing.description || 'Description will appear here'}</p>
            </div>
        </div>
    );
};

export default PreviewBox;
