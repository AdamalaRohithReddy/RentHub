package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_images", indexes = {
    @Index(name = "idx_resource_image_resource", columnList = "resource_id")
})
public class ResourceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    @JsonBackReference
    private Resource resource;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ResourceImage() {}

    public ResourceImage(Resource resource, String imageUrl, String fileName) {
        this.resource = resource;
        this.imageUrl = imageUrl;
        this.fileName = fileName;
        this.createdAt = LocalDateTime.now();
    }

    public ResourceImage(String imageUrl, String fileName) {
        this.imageUrl = imageUrl;
        this.fileName = fileName;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
