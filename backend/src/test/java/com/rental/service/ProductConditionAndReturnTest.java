package com.rental.service;

import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.dto.OrderDTO.DamageReportResponse;
import com.rental.dto.OrderDTO.OrderResponse;
import com.rental.dto.OrderDTO.ReportDamageRequest;
import com.rental.dto.OrderDTO.ReturnInspectionResponse;
import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.entity.*;
import com.rental.entity.enums.ConditionScanType;
import com.rental.entity.enums.ConditionStatus;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.repository.*;
import com.rental.service.ConditionComparisonService.ConditionComparisonResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductConditionAndReturnTest {

    private ResourceRepository resourceRepository;
    private UserRepository userRepository;
    private OrderRepository orderRepository;
    private DamageReportRepository damageReportRepository;
    private ProductConditionHistoryRepository conditionHistoryRepository;
    private ConditionScanService conditionScanService;
    private ConditionComparisonService comparisonService;
    private ProductConditionHistoryService historyService;
    private NotificationRepository notificationRepository;
    private NotificationService notificationService;
    private OrderService orderService;
    private ResourceService resourceService;
    private ReturnService returnService;

    private User owner;
    private User customer;
    private Resource resource;
    private Order order;

    @BeforeEach
    void setUp() {
        resourceRepository = mock(ResourceRepository.class);
        userRepository = mock(UserRepository.class);
        orderRepository = mock(OrderRepository.class);
        damageReportRepository = mock(DamageReportRepository.class);
        conditionHistoryRepository = mock(ProductConditionHistoryRepository.class);
        ProductConditionScanRepository conditionScanRepository = mock(ProductConditionScanRepository.class);
        when(conditionScanRepository.save(any(ProductConditionScan.class))).thenAnswer(i -> i.getArgument(0));
        ConditionIssueRepository conditionIssueRepository = mock(ConditionIssueRepository.class);
        ImageQualityService imageQualityService = new ImageQualityService();

        conditionScanService = new ConditionScanService(conditionScanRepository, conditionIssueRepository, imageQualityService);
        comparisonService = new ConditionComparisonService();
        notificationRepository = mock(NotificationRepository.class);

        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));
        notificationService = new NotificationService(notificationRepository);

        when(conditionHistoryRepository.save(any(ProductConditionHistory.class))).thenAnswer(i -> i.getArgument(0));
        historyService = new ProductConditionHistoryService(conditionHistoryRepository);

        orderService = new OrderService(orderRepository, resourceRepository, userRepository, notificationService);
        resourceService = new ResourceService(resourceRepository, userRepository, orderRepository, conditionScanService, historyService);
        returnService = new ReturnService(
                orderRepository, resourceRepository, damageReportRepository,
                conditionScanService, comparisonService, historyService,
                notificationService, orderService
        );

        owner = new User();
        owner.setId(1L);
        owner.setFullName("Rohith Owner");
        owner.setEmail("owner@example.com");

        customer = new User();
        customer.setId(2L);
        customer.setFullName("Anil Borrower");
        customer.setEmail("anil@example.com");

        resource = new Resource();
        resource.setId(10L);
        resource.setItemName("Bosch Power Drill");
        resource.setCategory("Tools");
        resource.setDescription("Professional cordless hammer drill");
        resource.setRentAmount(new BigDecimal("150.00"));
        resource.setRentDurationUnit("Per Day");
        resource.setSecurityDeposit(new BigDecimal("500.00"));
        resource.setTotalQuantity(5);
        resource.setAvailableQuantity(5);
        resource.setRentedQuantity(0);
        resource.setStatus("AVAILABLE");
        resource.setOwner(owner);

        order = new Order(resource, customer, owner, 2, new BigDecimal("300.00"), "Per Day", new BigDecimal("1000.00"));
        order.setId(100L);
        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setRequestedAt(LocalDateTime.now().minusDays(3));
    }

    @Test
    @DisplayName("createResource records condition scan and saves history with image URLs and owner notes")
    void testCreateResourceWithConditionReviewOverride() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> {
            Resource r = i.getArgument(0);
            r.setId(10L);
            return r;
        });

        MockMultipartFile photo1 = new MockMultipartFile("images", "drill1.jpg", "image/jpeg", "fake content 1".getBytes());
        MockMultipartFile photo2 = new MockMultipartFile("images", "drill2.jpg", "image/jpeg", "fake content 2".getBytes());

        ResourceResponse response = resourceService.createResource(
                1L,
                "Bosch Power Drill",
                "Tools",
                "Professional cordless hammer drill",
                new BigDecimal("150.00"),
                "Per Day",
                new BigDecimal("500.00"),
                3,
                LocalDate.now(),
                LocalDate.now().plusDays(30),
                "Hand Delivery",
                "Hyderabad",
                List.of(photo1, photo2),
                "EXCELLENT",
                95,
                List.of("NO_MAJOR_DAMAGE"),
                "Owner note: Brand new battery included"
        );

        assertNotNull(response);
        assertEquals("Bosch Power Drill", response.getItemName());

        ArgumentCaptor<ProductConditionHistory> historyCaptor = ArgumentCaptor.forClass(ProductConditionHistory.class);
        verify(conditionHistoryRepository, times(1)).save(historyCaptor.capture());

        ProductConditionHistory savedHistory = historyCaptor.getValue();
        assertEquals(ConditionScanType.INITIAL_LISTING, savedHistory.getScanType());
        assertEquals(ConditionStatus.EXCELLENT, savedHistory.getConditionStatus());
        assertEquals(95, savedHistory.getConditionScore());
        assertTrue(savedHistory.getIsManualOverride());
        assertEquals("Owner note: Brand new battery included", savedHistory.getOwnerNotes());
        assertEquals(owner.getId(), savedHistory.getAssessor().getId());
        assertNotNull(savedHistory.getImageUrls());
        assertTrue(savedHistory.getImageUrls().contains("/uploads/products/Rohith-Owner/"));
    }

    @Test
    @DisplayName("scanReturnedProduct rejects inspection if order is already RETURNED or CANCELLED")
    void testScanReturnedProductTerminalStatusCheck() {
        order.setStatus(OrderStatus.RETURNED);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));

        MockMultipartFile photo = new MockMultipartFile("images", "returned.jpg", "image/jpeg", "bytes".getBytes());
        List<MultipartFile> photos = List.of(photo);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                returnService.scanReturnedProduct(100L, 1L, photos)
        );
        assertTrue(ex.getMessage().contains("already been completed"));

        order.setStatus(OrderStatus.CANCELLED_BY_CUSTOMER);
        BadRequestException ex2 = assertThrows(BadRequestException.class, () ->
                returnService.scanReturnedProduct(100L, 1L, photos)
        );
        assertTrue(ex2.getMessage().contains("Cannot inspect a cancelled"));
    }

    @Test
    @DisplayName("scanReturnedProduct saves returned photos, runs comparison, and sets status to RETURN_INSPECTION_PENDING")
    void testScanReturnedProductSuccess() {
        order.setStatus(OrderStatus.RETURN_REQUESTED);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        MockMultipartFile photo1 = new MockMultipartFile("images", "ret1.jpg", "image/jpeg", "image1".getBytes());
        MockMultipartFile photo2 = new MockMultipartFile("images", "ret2.jpg", "image/jpeg", "image2".getBytes());

        ReturnInspectionResponse resp = returnService.scanReturnedProduct(100L, 1L, List.of(photo1, photo2));

        assertNotNull(resp);
        assertEquals(OrderStatus.RETURN_INSPECTION_PENDING, order.getStatus());
        assertNotNull(resp.getReturnedImages());
        assertEquals(2, resp.getReturnedImages().size());
        assertTrue(resp.getReturnedImages().get(0).contains("/returns/"));

        ArgumentCaptor<ProductConditionHistory> historyCaptor = ArgumentCaptor.forClass(ProductConditionHistory.class);
        verify(conditionHistoryRepository, times(1)).save(historyCaptor.capture());
        ProductConditionHistory savedHist = historyCaptor.getValue();
        assertEquals(ConditionScanType.AFTER_RETURN, savedHist.getScanType());
        assertEquals(owner.getId(), savedHist.getAssessor().getId());
        assertNotNull(savedHist.getImageUrls());
    }

    @Test
    @DisplayName("confirmReturn restores product quantity and prevents duplicate confirmation")
    void testConfirmReturnRestoresStockAndPreventsDuplicates() {
        resource.setAvailableQuantity(3);
        resource.setRentedQuantity(2);
        order.setStatus(OrderStatus.RETURN_INSPECTION_PENDING);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse res = returnService.confirmReturn(100L, 1L);

        assertEquals(OrderStatus.RETURNED, res.getStatus());
        assertEquals(5, resource.getAvailableQuantity());
        assertEquals(0, resource.getRentedQuantity());
        assertEquals("AVAILABLE", resource.getStatus());

        // Attempt second confirmation -> must fail
        assertThrows(BadRequestException.class, () -> returnService.confirmReturn(100L, 1L));
    }

    @Test
    @DisplayName("reportDamage creates damage report and restores stock so inventory is not permanently locked")
    void testReportDamageRestoresStock() {
        resource.setAvailableQuantity(3);
        resource.setRentedQuantity(2);
        order.setStatus(OrderStatus.RETURN_INSPECTION_PENDING);

        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArgument(0));
        when(damageReportRepository.save(any(DamageReport.class))).thenAnswer(i -> {
            DamageReport r = i.getArgument(0);
            r.setId(50L);
            return r;
        });

        ReportDamageRequest req = new ReportDamageRequest();
        req.setDescription("Chuck cracked during use");
        req.setReturnedScore(65);
        req.setDetectedIssues(List.of("CRACK_DETECTED"));

        DamageReportResponse resp = returnService.reportDamage(100L, 1L, req);

        assertNotNull(resp);
        assertEquals(OrderStatus.DAMAGE_REPORTED, order.getStatus());
        assertEquals(5, resource.getAvailableQuantity());
        assertEquals(0, resource.getRentedQuantity());

        // Attempting to finalize again must be rejected
        assertThrows(BadRequestException.class, () -> returnService.reportDamage(100L, 1L, req));
    }
}
