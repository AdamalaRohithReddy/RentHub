package com.rental.service;

import com.rental.dto.ProfileStatisticsResponse;
import com.rental.dto.UpdateProfileRequest;
import com.rental.dto.UserProfileResponse;
import com.rental.entity.Order;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.OrderRepository;
import com.rental.repository.ResourceRepository;
import com.rental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final OrderRepository orderRepository;
    private final ProfileImageService profileImageService;

    public UserService(UserRepository userRepository,
                       ResourceRepository resourceRepository,
                       OrderRepository orderRepository,
                       ProfileImageService profileImageService) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.orderRepository = orderRepository;
        this.profileImageService = profileImageService;
    }

    /**
     * Fetches current authenticated user profile
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToProfileResponse(user);
    }

    /**
     * Updates profile details (Full name, Email, Address, City, State, Pincode)
     * Note: Phone number and KYC status cannot be altered directly via profile update.
     */
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // 1. Email check
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String cleanEmail = request.getEmail().trim().toLowerCase();
            if (!cleanEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailAndIdNot(cleanEmail, userId)) {
                    throw new BadRequestException("The email address '" + cleanEmail + "' is already registered to another account.");
                }
                user.setEmail(cleanEmail);
            }
        }

        // 2. Full Name
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        // 3. Address details
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            user.setState(request.getState().trim());
        }
        if (request.getPincode() != null) {
            user.setPincode(request.getPincode().trim());
        }

        user = userRepository.save(user);
        return mapToProfileResponse(user);
    }

    /**
     * Uploads and sets a new profile photo in uploads/profiles/user_{id}/
     */
    @Transactional
    public UserProfileResponse uploadProfilePhoto(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String relativePath = profileImageService.storeProfileImage(user, file);
        user.setProfileImageUrl(relativePath);
        user = userRepository.save(user);

        return mapToProfileResponse(user);
    }

    /**
     * Computes live activity statistics for the authenticated user from MySQL database
     */
    @Transactional(readOnly = true)
    public ProfileStatisticsResponse getProfileStatistics(Long userId) {
        // 1. Products listed by this user
        List<Resource> myProducts = resourceRepository.findByOwnerIdOrderByCreatedAtDesc(userId);
        long productsListed = myProducts.size();

        // 2. Currently rented out units
        long currentlyRentedOut = myProducts.stream()
                .mapToLong(p -> (p.getRentedQuantity() != null ? p.getRentedQuantity() : 0))
                .sum();

        // 3. Orders requested by this user (as customer/borrower)
        List<Order> myCustomerOrders = orderRepository.findByCustomerIdOrderByRequestedAtDesc(userId);
        long ordersMade = myCustomerOrders.size();

        // 4. Active rentals (where user is currently renting)
        List<OrderStatus> activeStatuses = Arrays.asList(
                OrderStatus.ACCEPTED, 
                OrderStatus.RENTED, 
                OrderStatus.RETURN_REQUESTED,
                OrderStatus.RETURN_INSPECTION_PENDING
        );
        long activeRentals = myCustomerOrders.stream()
                .filter(o -> activeStatuses.contains(o.getStatus()))
                .count();

        // 5. Pending requests (customer pending requests + owner incoming pending requests)
        List<Order> myReceivedOrders = orderRepository.findByOwnerIdOrderByRequestedAtDesc(userId);
        long customerPending = myCustomerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();
        long ownerPending = myReceivedOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.RETURN_REQUESTED)
                .count();
        long pendingRequests = customerPending + ownerPending;

        return new ProfileStatisticsResponse(
                productsListed,
                currentlyRentedOut,
                ordersMade,
                activeRentals,
                pendingRequests
        );
    }

    /**
     * Maps User entity to UserProfileResponse DTO
     */
    public UserProfileResponse mapToProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhoneNumber());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(user.getAddress());
        response.setCity(user.getCity());
        response.setState(user.getState());
        response.setPincode(user.getPincode());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setKycStatus(user.getKycStatus());
        response.setRole(user.getRole());
        response.setTrustScore(user.getTrustScore());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
