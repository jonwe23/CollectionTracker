package com.postgresql.collectionTracker.controller.dto;

import lombok.Data;

@Data
public class ListingUpdateRequest {
    private String title;
    private Double price;
    private String description;
    private String ownerEmail;
}

