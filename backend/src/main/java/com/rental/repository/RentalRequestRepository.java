package com.rental.repository;

import com.rental.entity.RentalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long> {
    List<RentalRequest> findByBorrowerId(Long borrowerId);
    List<RentalRequest> findByProductOwnerId(Long ownerId);
}
