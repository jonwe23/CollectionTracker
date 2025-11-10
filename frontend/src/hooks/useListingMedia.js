import { useEffect, useState } from 'react';

function useListingMedia(listingId) {
    const [mediaUrl, setMediaUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = null;

        const fetchMedia = async () => {
            if (!listingId) {
                setMediaUrl(null);
                return;
            }

            setIsLoading(true);

            try {
                const response = await fetch(`http://localhost:8080/media/listing/${listingId}`);
                if (!response.ok) {
                    throw new Error(`Failed to load media for listing ${listingId}`);
                }

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                if (isMounted) {
                    setMediaUrl(objectUrl);
                }
            } catch (error) {
                console.error(error);
                if (isMounted) {
                    setMediaUrl(null);
                }
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchMedia();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [listingId]);

    return { mediaUrl, isLoading };
}

export default useListingMedia;

