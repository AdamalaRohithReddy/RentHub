package com.rental.service;

import com.rental.dto.OrderDTO.CreateOrderRequest;
import com.rental.dto.OrderDTO.OrderResponse;
import com.rental.entity.Notification;
import com.rental.entity.Order;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.repository.DamageReportRepository;
import com.rental.repository.NotificationRepository;
import com.rental.repository.OrderRepository;
import com.rental.repository.ResourceRepository;
import com.rental.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderQuantityAndCancellationTest {

    private OrderRepository orderRepository;
    private ResourceRepository resourceRepository;
    private UserRepository userRepository;
    private NotificationRepository notificationRepository;
    private NotificationService notificationService;
    private DamageReportRepository damageReportRepository;

    private OrderService orderService;
    private ReturnService returnService;

    private User owner;
    private User customer;
    private Resource resource;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        resourceRepository = mock(ResourceRepository.class);
        userRepository = mock(UserRepository.class);
        notificationRepository = mock(NotificationRepository.class);
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        notificationService = new NotificationService(notificationRepository);
        damageReportRepository = mock(DamageReportRepository.class);

        orderService = new OrderService(orderRepository, resourceRepository, userRepository, notificationService);
        returnService = new ReturnService(
                orderRepository, resourceRepository, damageReportRepository,
                null, null, null,
                notificationService, orderService
        );

        owner = new User("Vendor John", "vendor@example.com", "9876543210", "pass123", "XXXX XXXX 1111", null, null);
        owner.setId(1L);

        customer = new User("Customer Alice", "alice@example.com", "9123456780", "pass123", "XXXX XXXX 2222", null, null);
        customer.setId(2L);

        // Initial Resource: Total = 5, Available = 5, Rented = 0
        resource = new Resource(
                owner,
                "Water Purifier",
                "Home & Kitchen",
                "Clean water filter",
                BigDecimal.valueOf(100),
                "Per Day",
                BigDecimal.valueOf(500),
                5,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                "Pickup",
                "Madhapur"
        );
        resource.setId(10L);
    }

    @Test
    @DisplayName("1. Customer creates request -> Quantity is NOT reduced, status is PENDING")
    void testCreateOrderDoesNotReduceQuantity() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(customer));
        when(resourceRepository.findById(10L)).thenReturn(Optional.of(resource));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(100L);
            return o;
        });

        CreateOrderRequest req = new CreateOrderRequest();
        req.setResourceId(10L);
        req.setQuantity(2);

        OrderResponse res = orderService.createOrder(2L, req);

        assertEquals(OrderStatus.PENDING, res.getStatus());
        assertEquals(5, resource.getAvailableQuantity(), "Available quantity must remain 5 when customer requests");
    }

    @Test
    @DisplayName("2. Vendor accepts request -> Available quantity reduced (5 -> 3), Rented = 2, status is ACCEPTED")
    void testAcceptOrderReducesQuantity() {
        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = orderService.acceptOrder(100L, 1L);

        assertEquals(OrderStatus.ACCEPTED, res.getStatus());
        assertEquals(3, resource.getAvailableQuantity(), "Available quantity must be reduced to 3");
        assertEquals(2, resource.getRentedQuantity(), "Rented quantity must be 2");
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    @DisplayName("3. Customer cancels PENDING request -> Quantity is NOT changed (remains 5), status is CANCELLED_BY_CUSTOMER")
    void testCustomerCancelsPendingRequest() {
        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = orderService.cancelOrderByCustomer(100L, 2L);

        assertEquals(OrderStatus.CANCELLED_BY_CUSTOMER, res.getStatus());
        assertEquals(5, resource.getAvailableQuantity(), "Available quantity must remain 5");
        verify(resourceRepository, never()).save(resource);
    }

    @Test
    @DisplayName("4. Customer cancels ACCEPTED order -> Quantity is RESTORED (3 -> 5), status is CANCELLED_BY_CUSTOMER")
    void testCustomerCancelsAcceptedOrder() {
        // Resource state after acceptance: Avail = 3, Rented = 2
        resource.setAvailableQuantity(3);
        resource.setRentedQuantity(2);

        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.ACCEPTED);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = orderService.cancelOrderByCustomer(100L, 2L);

        assertEquals(OrderStatus.CANCELLED_BY_CUSTOMER, res.getStatus());
        assertEquals(5, resource.getAvailableQuantity(), "Available quantity must be restored to 5");
        assertEquals(0, resource.getRentedQuantity(), "Rented quantity must be 0");
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    @DisplayName("5. Vendor cancels ACCEPTED order -> Quantity is RESTORED (3 -> 5), status is CANCELLED_BY_VENDOR")
    void testVendorCancelsAcceptedOrder() {
        // Resource state after acceptance: Avail = 3, Rented = 2
        resource.setAvailableQuantity(3);
        resource.setRentedQuantity(2);

        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.ACCEPTED);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = orderService.cancelOrderByVendor(100L, 1L);

        assertEquals(OrderStatus.CANCELLED_BY_VENDOR, res.getStatus());
        assertEquals(5, resource.getAvailableQuantity(), "Available quantity must be restored to 5");
        assertEquals(0, resource.getRentedQuantity(), "Rented quantity must be 0");
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    @DisplayName("6. Prevent duplicate cancellation / quantity restoration")
    void testPreventDuplicateCancellation() {
        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.CANCELLED_BY_CUSTOMER);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> orderService.cancelOrderByCustomer(100L, 2L));
        assertThrows(BadRequestException.class, () -> orderService.cancelOrderByVendor(100L, 1L));
    }

    @Test
    @DisplayName("7. Vendor confirms RETURN -> Quantity is RESTORED (3 -> 5), status is RETURNED")
    void testConfirmReturnRestoresQuantity() {
        // Resource state while rented: Avail = 3, Rented = 2
        resource.setAvailableQuantity(3);
        resource.setRentedQuantity(2);

        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.RETURN_REQUESTED);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = returnService.confirmReturn(100L, 1L);

        assertEquals(OrderStatus.RETURNED, res.getStatus());
        assertEquals(5, resource.getAvailableQuantity(), "Available quantity must be restored back to 5 on return");
        assertEquals(0, resource.getRentedQuantity(), "Rented quantity must be 0");
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    @DisplayName("8. Prevent duplicate return confirmation")
    void testPreventDuplicateReturnConfirmation() {
        Order order = new Order(resource, customer, owner, 2, BigDecimal.valueOf(100), "Per Day", BigDecimal.valueOf(500));
        order.setId(100L);
        order.setStatus(OrderStatus.RETURNED);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> returnService.confirmReturn(100L, 1L));
    }
}
