package com.rental.service;

import com.rental.dto.NotificationDTO.NotificationResponse;
import com.rental.dto.NotificationDTO.UnreadCountResponse;
import com.rental.entity.Notification;
import com.rental.entity.Order;
import com.rental.entity.User;
import com.rental.entity.enums.NotificationType;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User recipient, Order order, String title, String message, NotificationType type) {
        if (recipient == null) {
            return null;
        }

        // Prevent duplicate notification when an action is retried
        if (order != null && order.getId() != null) {
            if (notificationRepository.existsByUserIdAndOrderIdAndType(recipient.getId(), order.getId(), type)) {
                System.out.println("⚠️ [Duplicate Notification Prevented] User: " + recipient.getId() + 
                                   " | Order: " + order.getId() + " | Type: " + type);
                return notificationRepository.findFirstByUserIdAndOrderIdAndType(recipient.getId(), order.getId(), type).orElse(null);
            }
        }

        Notification notification = new Notification(recipient, order, title, message, type);
        Notification saved = notificationRepository.save(notification);
        System.out.println("🔔 [Notification Created] For: " + recipient.getFullName() + 
                           " | Title: " + title + " | Type: " + type);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        return new UnreadCountResponse(count);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to modify this notification.");
        }

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to delete this notification.");
        }

        notificationRepository.delete(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setUserId(n.getUser().getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setIsRead(n.getIsRead());
        res.setCreatedAt(n.getCreatedAt());

        if (n.getOrder() != null) {
            res.setOrderId(n.getOrder().getId());
            if (n.getOrder().getResource() != null) {
                res.setResourceName(n.getOrder().getResource().getItemName());
            }
            res.setRequestedQuantity(n.getOrder().getQuantity());
        }

        return res;
    }
}
