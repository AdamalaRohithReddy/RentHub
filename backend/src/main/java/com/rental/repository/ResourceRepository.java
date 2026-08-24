package com.rental.repository;

import com.rental.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findAllByOrderByCreatedAtDesc();
    List<Resource> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Resource> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
    List<Resource> findByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(String name, String desc);
}
