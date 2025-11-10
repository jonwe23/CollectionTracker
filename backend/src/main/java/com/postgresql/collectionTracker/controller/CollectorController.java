package com.postgresql.collectionTracker.controller;

import com.postgresql.collectionTracker.entity.Collector;
import com.postgresql.collectionTracker.repository.CollectorRepository;
import com.postgresql.collectionTracker.login.LoginRequest;
import com.postgresql.collectionTracker.login.LoginResponse;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.HttpStatus;

@CrossOrigin
@RestController
public class CollectorController {

    @Autowired
    private CollectorRepository repo;

    @PostMapping("/addCollector")
    public Collector addCollector(@RequestBody Collector collector) {
        return repo.save(Objects.requireNonNull(collector, "Collector must not be null"));
    }

    @RequestMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        Collector collector = repo.findByEmailAndPassword(
            loginRequest.getEmail(), 
            loginRequest.getPassword());

        if (collector != null) {
            return ResponseEntity.ok(new LoginResponse(true, "Login successful"));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Invalid credentials"));
        }
    }
}
