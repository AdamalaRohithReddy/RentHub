package com.rental.repository;

import com.rental.entity.Notification;
import com.rental.entity.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndIsReadFalse(Long userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndOrderIdAndType(Long userId, Long orderId, NotificationType type);
    Optional<Notification> findFirstByUserIdAndOrderIdAndType(Long userId, Long orderId, NotificationType type);
}
