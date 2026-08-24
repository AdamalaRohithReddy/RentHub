package com.rental.repository;

import com.rental.entity.ResourceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceImageRepository extends JpaRepository<ResourceImage, Long> {
    List<ResourceImage> findByResourceId(Long resourceId);
}
