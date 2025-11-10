package com.postgresql.collectionTracker;

import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.postgresql.collectionTracker.entity.MediaData;
import com.postgresql.collectionTracker.service.StorageService;

@SpringBootApplication
@RestController
@RequestMapping("/media")
public class CollectionTracker {

    @Autowired
    private StorageService service;

    @PostMapping
    public ResponseEntity<?> uploadMedia(@RequestParam("id") Long id, @RequestParam("media") MultipartFile file) throws IOException {
        String uploadImage = service.uploadMedia(id, file);
        return ResponseEntity.status(HttpStatus.OK)
                .body(uploadImage);
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<?> downloadMedia(@PathVariable String fileName){
        byte[] mediaData = service.downloadMedia(fileName);
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(Objects.requireNonNull(MediaType.IMAGE_PNG))
                .body(mediaData);
    }

    @GetMapping("/listing/{listingId}")
    @SuppressWarnings("null")
    public ResponseEntity<?> downloadMediaByListingId(@PathVariable Long listingId){
        Long safeListingId = Objects.requireNonNull(listingId, "listingId must not be null");
        Optional<MediaData> mediaOptional = service.downloadMediaByListingId(safeListingId);
        if (mediaOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Media not found for listing " + safeListingId);
        }

        MediaData media = mediaOptional.get();
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(parseMediaType(media.getType()))
                .body(media.getMediaData());
    }

    public static void main(String[] args) {
        SpringApplication.run(CollectionTracker.class, args);
    }

    @SuppressWarnings("null")
    private MediaType parseMediaType(String type) {
        try {
            MediaType mediaType = MediaType.parseMediaType(type);
            return Objects.requireNonNull(mediaType);
        } catch (Exception ex) {
            return Objects.requireNonNull(MediaType.APPLICATION_OCTET_STREAM);
        }
    }
}
