package com.rental.repository;

import com.rental.entity.Order;
import com.rental.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByRequestedAtDesc(Long customerId);
    List<Order> findByOwnerIdOrderByRequestedAtDesc(Long ownerId);
    List<Order> findByCustomerIdAndStatusOrderByRequestedAtDesc(Long customerId, OrderStatus status);
    List<Order> findByOwnerIdAndStatusOrderByRequestedAtDesc(Long ownerId, OrderStatus status);
    List<Order> findByOwnerIdAndStatusInOrderByRequestedAtDesc(Long ownerId, List<OrderStatus> statuses);
    List<Order> findByResourceIdAndStatusIn(Long resourceId, List<OrderStatus> statuses);
}
