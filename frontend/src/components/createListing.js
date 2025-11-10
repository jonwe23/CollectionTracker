import React, { useState, useRef, useEffect } from 'react';
import './createListing.css';

function CreateListing() {
    const [formState, setFormState] = useState({ id: null, title: '', price: '', description: '', media: null });
    const photoInputRef = useRef(null);
    const previewContainerRef = useRef(null);

    useEffect(() => {
        const updatePreviewSize = () => {
            if (!previewContainerRef.current) {
                return;
            }
            const aspectRatio = 16 / 12;
            const width = previewContainerRef.current.offsetWidth;
            previewContainerRef.current.style.height = `${width / aspectRatio}px`;
        };

        updatePreviewSize();
        window.addEventListener('resize', updatePreviewSize);
        return () => window.removeEventListener('resize', updatePreviewSize);
    }, [formState.media]);

    const handleChange = (key) => (e) => {
        if (key === 'price') {
            const pattern = /^\d{1,8}(\.\d{0,2})?$/;
            if (pattern.test(e.target.value)) setFormState(prev => ({ ...prev, [key]: e.target.value }));
        } else if (key === 'description') {
            const words = e.target.value.split(/\s+/);
            if (words.length <= 150) setFormState(prev => ({ ...prev, [key]: e.target.value }));
            else alert("Description cannot exceed 150 words.");
        } else {
            setFormState(prev => ({ ...prev, [key]: e.target.value }));
        }
    };

    const handleMediaChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image')) {
            const id = Date.now();
            const newMediaItem = {
                id: id,
                type: 'image',
                file: file,
                url: URL.createObjectURL(file),
                aspectRatio: 16 / 12,
            };

            setFormState(prev => ({ ...prev, id: id, media: newMediaItem })); 
        }
    };

    const handleRemoveImage = () => {
        setFormState(prev => ({ ...prev, media: null }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        if (!formState.media) {
            alert('Please attach a photo to create a listing.');
            return;
        }
    
        if (!formState.title || !formState.price || !formState.description) {
            alert('Please provide a title, price, and description to create a listing.');
            return;
        }

        const ownerEmail = localStorage.getItem('email');

        if (!ownerEmail) {
            alert('You need to be logged in to create a listing.');
            return;
        }
    
        try {
            const listingResponse = await fetch('http://localhost:8080/addListing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formState.title,
                    price: formState.price,
                    description: formState.description,
                    ownerEmail: ownerEmail
                }),
            });
    
            if (!listingResponse.ok) {
                throw new Error(`Failed to create listing! status: ${listingResponse.status}`);
            }
    
            const listingData = await listingResponse.json();
            const id = listingData.id; 
    
            if (formState.media) {
                const mediaFormData = new FormData();
                mediaFormData.append('id', id);
                mediaFormData.append('media', formState.media.file);
    
                const mediaResponse = await fetch('http://localhost:8080/media', {
                    method: 'POST',
                    body: mediaFormData,
                });
    
                if (!mediaResponse.ok) {
                    throw new Error(`Failed to upload media! status: ${mediaResponse.status}`);
                }
            }
    
            alert('Listing created successfully!');
            console.log('Listing created successfully!');
            
            window.location.href = "/user";
    
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create listing');
        }
    };
    
    return (
        <div className="CreateListing">
            <header className="header">
                <button onClick={() => window.history.back()} className="back-button">X</button>
                <h1>CollectionTracker</h1>
            </header>
            <main className="main-content">
                <aside className="sidebar">
                    <h2>Item for Sale</h2>
                    <div className="buttons-container">
                        <input type="file" ref={photoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleMediaChange} />
                        <button className="button-style" onClick={() => photoInputRef.current?.click()}>
                            Add Photo
                        </button>
                    </div>
                    <h3>Required</h3>
                    <input type="text" placeholder="Title" className="input-box" value={formState.title} onChange={handleChange('title')} />
                    <input type="number" placeholder="Price" className="input-box" value={formState.price} onChange={handleChange('price')} />
                    <textarea placeholder="Description" className="input-box" value={formState.description} onChange={handleChange('description')} />
                    <button type="submit" className="button-style" onClick={handleSubmit}>Create Listing</button>
                </aside>
                <section id="background">
                    <div className="preview-box">
                        <h2>Preview</h2>
                        <div className="preview-container" ref={previewContainerRef}>
                            <div className="media-preview" style={{ position: 'relative' }}>
                                {formState.media && (
                                    <img src={formState.media.url} alt="Upload" className="media-item" />
                                )}
                                {formState.media && (
                                    <button className="remove-button" style={{ position: 'absolute', right: '10px', top: '-335px' }} onClick={handleRemoveImage}>X</button>
                                )}
                            </div>
                            <div className="details-preview">
                                <h3>{formState.title || 'Title'}</h3>
                                <p>{formState.price ? `$${formState.price}` : 'Price'}</p>
                                <h3>Details</h3>
                                <p>{formState.description || 'Description will appear here.'}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default CreateListing;
