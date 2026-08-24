package com.rental.repository;

import com.rental.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByOwnerId(Long ownerId);
    List<Product> findByIsAvailableTrue();
    List<Product> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
}
