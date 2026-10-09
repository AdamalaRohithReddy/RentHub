package com.rental.service;

import com.rental.dto.NotificationDTO.NotificationResponse;
import com.rental.dto.NotificationDTO.UnreadCountResponse;
import com.rental.entity.Notification;
import com.rental.entity.Order;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.NotificationType;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private NotificationService notificationService;

    private User user1;
    private User user2;
    private Order order;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
        notificationService = new NotificationService(notificationRepository);

        user1 = new User();
        user1.setId(1L);
        user1.setFullName("Alice Customer");
        user1.setEmail("alice@example.com");

        user2 = new User();
        user2.setId(2L);
        user2.setFullName("Bob Vendor");
        user2.setEmail("bob@example.com");

        Resource resource = new Resource();
        resource.setId(10L);
        resource.setItemName("Bosch Drill");
        resource.setOwner(user2);

        order = new Order();
        order.setId(100L);
        order.setCustomer(user1);
        order.setOwner(user2);
        order.setResource(resource);
        order.setQuantity(2);
    }

    @Test
    @DisplayName("Create notification saves entity with isRead=false and correct details")
    void testCreateNotification() {
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification n = invocation.getArgument(0);
            n.setId(501L);
            return n;
        });

        Notification result = notificationService.createNotification(
                user1, order, "Order Accepted", "Your order has been accepted.", NotificationType.ORDER_ACCEPTED
        );

        assertNotNull(result);
        assertEquals(501L, result.getId());
        assertEquals(user1, result.getUser());
        assertEquals(order, result.getOrder());
        assertEquals("Order Accepted", result.getTitle());
        assertEquals(NotificationType.ORDER_ACCEPTED, result.getType());
        assertFalse(result.getIsRead());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    @DisplayName("Duplicate notification check prevents multiple notifications on retry")
    void testPreventDuplicateNotification() {
        Notification existing = new Notification(user1, order, "Order Accepted", "Your order has been accepted.", NotificationType.ORDER_ACCEPTED);
        existing.setId(777L);

        when(notificationRepository.existsByUserIdAndOrderIdAndType(1L, 100L, NotificationType.ORDER_ACCEPTED)).thenReturn(true);
        when(notificationRepository.findFirstByUserIdAndOrderIdAndType(1L, 100L, NotificationType.ORDER_ACCEPTED)).thenReturn(Optional.of(existing));

        Notification result = notificationService.createNotification(
                user1, order, "Order Accepted", "Your order has been accepted.", NotificationType.ORDER_ACCEPTED
        );

        assertNotNull(result);
        assertEquals(777L, result.getId());
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Create notification handles null recipient safely")
    void testCreateNotificationNullRecipient() {
        Notification result = notificationService.createNotification(
                null, order, "Test", "Message", NotificationType.ORDER_REQUEST
        );
        assertNull(result);
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get user notifications returns mapped responses in order")
    void testGetUserNotifications() {
        Notification n1 = new Notification(user1, order, "Request Accepted", "Accepted!", NotificationType.ORDER_ACCEPTED);
        n1.setId(10L);
        Notification n2 = new Notification(user1, order, "Return Confirmed", "Confirmed!", NotificationType.RETURN_CONFIRMED);
        n2.setId(11L);

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(n2, n1));

        List<NotificationResponse> list = notificationService.getUserNotifications(1L);
        assertEquals(2, list.size());
        assertEquals(11L, list.get(0).getId());
        assertEquals(10L, list.get(1).getId());
        assertEquals("Bosch Drill", list.get(0).getResourceName());
    }

    @Test
    @DisplayName("Get unread count returns accurate number of unread alerts")
    void testGetUnreadCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(3L);

        UnreadCountResponse resp = notificationService.getUnreadCount(1L);
        assertEquals(3L, resp.getCount());
        verify(notificationRepository, times(1)).countByUserIdAndIsReadFalse(1L);
    }

    @Test
    @DisplayName("Mark as read succeeds when user is the owner of the notification")
    void testMarkAsReadSuccess() {
        Notification n = new Notification(user1, order, "Alert", "Msg", NotificationType.ORDER_ACCEPTED);
        n.setId(50L);
        assertFalse(n.getIsRead());

        when(notificationRepository.findById(50L)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(50L, 1L);
        assertNotNull(response);
        assertTrue(response.getIsRead());
        verify(notificationRepository, times(1)).save(n);
    }

    @Test
    @DisplayName("Mark as read throws BadRequestException when unauthorized user attempts access")
    void testMarkAsReadUnauthorized() {
        Notification n = new Notification(user1, order, "Alert", "Msg", NotificationType.ORDER_ACCEPTED);
        n.setId(50L);

        when(notificationRepository.findById(50L)).thenReturn(Optional.of(n));

        assertThrows(BadRequestException.class, () -> {
            notificationService.markAsRead(50L, 2L); // user 2 trying to read user 1's notification
        });

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Mark all as read updates all unread notifications to true")
    void testMarkAllAsRead() {
        Notification n1 = new Notification(user1, order, "N1", "M1", NotificationType.ORDER_REQUEST);
        n1.setIsRead(false);
        Notification n2 = new Notification(user1, order, "N2", "M2", NotificationType.ORDER_ACCEPTED);
        n2.setIsRead(false);

        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(n1, n2));

        notificationService.markAllAsRead(1L);

        assertTrue(n1.getIsRead());
        assertTrue(n2.getIsRead());
        verify(notificationRepository, times(1)).saveAll(Arrays.asList(n1, n2));
    }

    @Test
    @DisplayName("Delete notification succeeds for authorized owner")
    void testDeleteNotificationSuccess() {
        Notification n = new Notification(user1, order, "Alert", "Msg", NotificationType.ORDER_ACCEPTED);
        n.setId(99L);

        when(notificationRepository.findById(99L)).thenReturn(Optional.of(n));

        notificationService.deleteNotification(99L, 1L);
        verify(notificationRepository, times(1)).delete(n);
    }

    @Test
    @DisplayName("Delete notification blocks unauthorized user")
    void testDeleteNotificationUnauthorized() {
        Notification n = new Notification(user1, order, "Alert", "Msg", NotificationType.ORDER_ACCEPTED);
        n.setId(99L);

        when(notificationRepository.findById(99L)).thenReturn(Optional.of(n));

        assertThrows(BadRequestException.class, () -> {
            notificationService.deleteNotification(99L, 2L); // user 2 trying to delete user 1's alert
        });

        verify(notificationRepository, never()).delete(any());
    }
}
