package com.rental.service;

import com.rental.dto.ProfileStatisticsResponse;
import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.dto.ResourceDTO.UpdateResourceRequest;
import com.rental.dto.UpdateProfileRequest;
import com.rental.dto.UserProfileResponse;
import com.rental.entity.Order;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.KycStatus;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.repository.OrderRepository;
import com.rental.repository.ResourceRepository;
import com.rental.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserProfileAndProductOwnershipTest {

    private UserRepository userRepository;
    private ResourceRepository resourceRepository;
    private OrderRepository orderRepository;
    private ProfileImageService profileImageService;

    private UserService userService;
    private ResourceService resourceService;

    private User owner;
    private User otherUser;
    private Resource resource;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        resourceRepository = mock(ResourceRepository.class);
        orderRepository = mock(OrderRepository.class);
        profileImageService = new ProfileImageService("target/test-uploads/profiles");

        userService = new UserService(userRepository, resourceRepository, orderRepository, profileImageService);
        resourceService = new ResourceService(resourceRepository, userRepository, orderRepository, null, null);

        owner = new User("John Doe", "john@example.com", "9876543210", "securePass123", "XXXX XXXX 1111", null, null);
        owner.setId(101L);
        owner.setAddress("Flat 101, Green Valley");
        owner.setCity("Hyderabad");
        owner.setState("Telangana");
        owner.setPincode("500081");
        owner.setKycStatus(KycStatus.VERIFIED);

        otherUser = new User("Mallory Attacker", "mallory@example.com", "9123456780", "pass123", "XXXX XXXX 2222", null, null);
        otherUser.setId(202L);

        resource = new Resource(
                owner,
                "Drill Machine",
                "Power & Hand Tools",
                "Heavy duty hammer drill",
                BigDecimal.valueOf(150),
                "Per Day",
                BigDecimal.valueOf(500),
                5,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                "In-Person",
                "Madhapur"
        );
        resource.setId(505L);
        resource.setRentedQuantity(2);
        resource.setAvailableQuantity(3);
    }

    @Test
    @DisplayName("1. Get Profile: Returns public details and prevents exposing password or private KYC numbers")
    void testGetProfileExcludesSensitiveData() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(owner));

        UserProfileResponse res = userService.getProfile(101L);

        assertNotNull(res);
        assertEquals("John Doe", res.getFullName());
        assertEquals("john@example.com", res.getEmail());
        assertEquals("9876543210", res.getPhoneNumber());
        assertEquals(KycStatus.VERIFIED, res.getKycStatus());
        assertEquals("Hyderabad", res.getCity());
    }

    @Test
    @DisplayName("2. Update Profile: Updates full name, address, city and preserves phone number & KYC status")
    void testUpdateProfileProtectsPhoneAndKyc() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(owner));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("John Updated");
        req.setEmail("john.new@example.com");
        req.setAddress("Villa 45, Jubilee Hills");
        req.setCity("Secunderabad");
        req.setState("Telangana");
        req.setPincode("500003");

        UserProfileResponse res = userService.updateProfile(101L, req);

        assertEquals("John Updated", res.getFullName());
        assertEquals("john.new@example.com", res.getEmail());
        assertEquals("Villa 45, Jubilee Hills", res.getAddress());
        assertEquals("Secunderabad", res.getCity());
        // Verify phone and KYC status remain unchanged
        assertEquals("9876543210", res.getPhoneNumber());
        assertEquals(KycStatus.VERIFIED, res.getKycStatus());
    }

    @Test
    @DisplayName("3. Update Profile: Rejects email if already taken by another account")
    void testUpdateProfileDuplicateEmailRejected() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(owner));
        when(userRepository.existsByEmailAndIdNot("taken@example.com", 101L)).thenReturn(true);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setEmail("taken@example.com");

        assertThrows(BadRequestException.class, () -> userService.updateProfile(101L, req));
    }

    @Test
    @DisplayName("4. Profile Statistics: Correctly calculates listed products, rented out, orders made, active, and pending")
    void testProfileStatistics() {
        when(resourceRepository.findByOwnerIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(resource));

        // Mock orders requested by owner as customer
        Order customerOrder = new Order(resource, owner, otherUser, 1, BigDecimal.valueOf(150), "Per Day", BigDecimal.valueOf(500));
        customerOrder.setStatus(OrderStatus.ACCEPTED);
        when(orderRepository.findByCustomerIdOrderByRequestedAtDesc(101L)).thenReturn(List.of(customerOrder));

        // Mock orders received by owner
        Order receivedOrder = new Order(resource, otherUser, owner, 2, BigDecimal.valueOf(150), "Per Day", BigDecimal.valueOf(500));
        receivedOrder.setStatus(OrderStatus.PENDING);
        when(orderRepository.findByOwnerIdOrderByRequestedAtDesc(101L)).thenReturn(List.of(receivedOrder));

        ProfileStatisticsResponse stats = userService.getProfileStatistics(101L);

        assertEquals(1, stats.getProductsListed());
        assertEquals(2, stats.getCurrentlyRentedOut(), "Rented units must be 2");
        assertEquals(1, stats.getOrdersMade());
        assertEquals(1, stats.getActiveRentals());
        assertEquals(1, stats.getPendingRequests());
    }

    @Test
    @DisplayName("5. My Products: Returns only products listed by the authenticated user")
    void testGetMyProductsOnlyReturnsUserProducts() {
        when(resourceRepository.findByOwnerIdOrderByCreatedAtDesc(101L)).thenReturn(List.of(resource));

        List<ResourceResponse> myProducts = resourceService.getMyProducts(101L);

        assertEquals(1, myProducts.size());
        assertEquals("Drill Machine", myProducts.get(0).getItemName());
        assertEquals(101L, myProducts.get(0).getOwnerId());
    }

    @Test
    @DisplayName("6. Product Ownership Security: User B cannot update User A's product")
    void testUnauthorizedUserCannotUpdateProduct() {
        when(resourceRepository.findById(505L)).thenReturn(Optional.of(resource));

        UpdateResourceRequest req = new UpdateResourceRequest();
        req.setItemName("Hacked Title");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resourceService.updateResource(505L, 202L, req)
        );

        assertTrue(ex.getMessage().contains("not authorized to edit this product"));
        verify(resourceRepository, never()).save(any());
    }

    @Test
    @DisplayName("7. Product Quantity Consistency: Owner cannot set totalQuantity lower than currently rented quantity")
    void testTotalQuantityCannotBeLessThanRented() {
        when(resourceRepository.findById(505L)).thenReturn(Optional.of(resource));

        Order activeOrder = new Order(resource, otherUser, owner, 2, BigDecimal.valueOf(150), "Per Day", BigDecimal.valueOf(500));
        activeOrder.setStatus(OrderStatus.ACCEPTED);
        when(orderRepository.findByResourceIdAndStatusIn(eq(505L), anyList())).thenReturn(List.of(activeOrder));

        UpdateResourceRequest req = new UpdateResourceRequest();
        req.setTotalQuantity(1); // Currently rented = 2, so 1 must fail

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                resourceService.updateResource(505L, 101L, req)
        );

        assertTrue(ex.getMessage().contains("cannot be less than the quantity currently rented"));
    }

    @Test
    @DisplayName("8. Product Update Success: Owner updates pricing and total quantity properly")
    void testOwnerSuccessfullyUpdatesProduct() {
        when(resourceRepository.findById(505L)).thenReturn(Optional.of(resource));

        Order activeOrder = new Order(resource, otherUser, owner, 2, BigDecimal.valueOf(150), "Per Day", BigDecimal.valueOf(500));
        activeOrder.setStatus(OrderStatus.ACCEPTED);
        when(orderRepository.findByResourceIdAndStatusIn(eq(505L), anyList())).thenReturn(List.of(activeOrder));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));

        UpdateResourceRequest req = new UpdateResourceRequest();
        req.setItemName("Pro Drill Machine");
        req.setRentAmount(BigDecimal.valueOf(200));
        req.setTotalQuantity(8); // Rented = 2 -> Available must become 8 - 2 = 6

        ResourceResponse res = resourceService.updateResource(505L, 101L, req);

        assertEquals("Pro Drill Machine", res.getItemName());
        assertEquals(BigDecimal.valueOf(200), res.getRentAmount());
        assertEquals(8, res.getTotalQuantity());
        assertEquals(6, res.getAvailableQuantity(), "Available quantity should be updated to total - rented (8 - 2 = 6)");
        assertEquals(2, res.getRentedQuantity());
    }
}
