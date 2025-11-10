package com.postgresql.collectionTracker.controller;

import com.postgresql.collectionTracker.entity.Listing;
import com.postgresql.collectionTracker.repository.ListingRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class ListingController {

    @Autowired
    ListingRepository repo;

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

}
