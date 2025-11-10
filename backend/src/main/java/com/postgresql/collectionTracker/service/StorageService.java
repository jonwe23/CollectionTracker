package com.postgresql.collectionTracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.postgresql.collectionTracker.entity.MediaData;
import com.postgresql.collectionTracker.repository.StorageRepository;
import com.postgresql.collectionTracker.util.MediaUtils;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.Objects;
import java.util.Optional;

@Service
public class StorageService {

    @Autowired
    private StorageRepository repository;

    @Transactional
    public String uploadMedia(Long id, MultipartFile file) throws IOException {
        MediaData media = repository.findByListingId(id)
                .orElseGet(MediaData::new);

        media.setListingId(id);
        media.setName(file.getOriginalFilename());
        media.setType(file.getContentType());
        media.setMediaData(MediaUtils.compressMedia(file.getBytes()));

        repository.save(media);
        return "file uploaded successfully : " + file.getOriginalFilename();
    }

    @Transactional
    public byte[] downloadMedia(String fileName){
        Optional<MediaData> dbMediaData = repository.findByName(fileName);
        byte[] medias=MediaUtils.decompressMedia(dbMediaData.get().getMediaData());
        return medias;
    }

    @Transactional
    public Optional<MediaData> downloadMediaByListingId(Long listingId){
        Long safeListingId = Objects.requireNonNull(listingId, "listingId must not be null");
        return repository.findByListingId(safeListingId)
                .map(media -> {
                    MediaData decompressed = new MediaData();
                    decompressed.setId(media.getId());
                    decompressed.setName(media.getName());
                    decompressed.setListingId(media.getListingId());
                    decompressed.setType(media.getType());
                    decompressed.setMediaData(MediaUtils.decompressMedia(media.getMediaData()));
                    return decompressed;
                });
    }

    @Transactional
    public void deleteMediaByListingId(Long listingId) {
        Long safeListingId = Objects.requireNonNull(listingId, "listingId must not be null");
        repository.deleteByListingId(safeListingId);
    }
}
