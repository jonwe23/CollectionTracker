package com.postgresql.collectionTracker.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "listing")
public class Listing {
    @Id
    private long id;
    private String title;
    private double price;
    private String description;
    private String ownerEmail;
}
