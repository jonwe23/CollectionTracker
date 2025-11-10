package com.postgresql.collectionTracker.repository;

import com.postgresql.collectionTracker.entity.MediaData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StorageRepository extends JpaRepository<MediaData, Long> {
    Optional<MediaData> findByName(String fileName);
    Optional<MediaData> findByListingId(Long listingId);
}
