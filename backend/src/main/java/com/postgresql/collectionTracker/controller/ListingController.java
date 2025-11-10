package com.postgresql.collectionTracker.controller;

import com.postgresql.collectionTracker.controller.dto.ListingUpdateRequest;
import com.postgresql.collectionTracker.entity.Listing;
import com.postgresql.collectionTracker.repository.ListingRepository;
import com.postgresql.collectionTracker.service.StorageService;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class ListingController {

    @Autowired
    private ListingRepository repo;

    @Autowired
    private StorageService storageService;

    private long lastId = 0; 

    @PostMapping("/addListing")
    public Listing addListing(@RequestBody Listing listing) {
        listing.setId(++lastId);
        return repo.save(listing);
    }

    @GetMapping("/listings")
    public List<Listing> getAllListings() {
        return repo.findAll();
    }

    @GetMapping("/listings/user/{email}")
    public List<Listing> getListingsForUser(@PathVariable String email) {
        return repo.findByOwnerEmail(email);
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<?> updateListing(@PathVariable Long id, @RequestBody ListingUpdateRequest request) {
        Objects.requireNonNull(request, "Listing update request must not be null");
        Long safeId = Objects.requireNonNull(id, "Listing id must not be null");

        if (request.getOwnerEmail() == null || request.getOwnerEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Owner email is required to update a listing.");
        }

        Optional<Listing> existingListing = repo.findById(safeId);
        if (existingListing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Listing not found.");
        }

        Listing listing = existingListing.get();
        if (!listing.getOwnerEmail().equals(request.getOwnerEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only edit your own listing.");
        }

        if (request.getTitle() != null) {
            listing.setTitle(request.getTitle());
        }
        if (request.getPrice() != null) {
            listing.setPrice(request.getPrice());
        }
        if (request.getDescription() != null) {
            listing.setDescription(request.getDescription());
        }

        Listing saved = repo.save(listing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id, @RequestParam("ownerEmail") String ownerEmail) {
        if (ownerEmail == null || ownerEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Owner email is required to delete a listing.");
        }

        Long safeId = Objects.requireNonNull(id, "Listing id must not be null");

        Optional<Listing> existingListing = repo.findById(safeId);
        if (existingListing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Listing not found.");
        }

        Listing listing = existingListing.get();
        if (!listing.getOwnerEmail().equals(ownerEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own listing.");
        }

        repo.delete(listing);
        storageService.deleteMediaByListingId(safeId);

        return ResponseEntity.noContent().build();
    }

}
