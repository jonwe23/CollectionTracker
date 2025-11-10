package com.postgresql.collectionTracker.repository;

import com.postgresql.collectionTracker.entity.Listing;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByOwnerEmail(String ownerEmail);
}
