package com.hospitalmgmt.ops.service;

import com.hospitalmgmt.ops.config.BillingProperties;
import com.hospitalmgmt.ops.dto.CreateOrderRequest;
import com.hospitalmgmt.ops.dto.OrderItemResponse;
import com.hospitalmgmt.ops.dto.OrderResponse;
import com.hospitalmgmt.ops.entity.CustomerOrder;
import com.hospitalmgmt.ops.entity.Invoice;
import com.hospitalmgmt.ops.entity.InvoiceStatus;
import com.hospitalmgmt.ops.entity.OrderItem;
import com.hospitalmgmt.ops.entity.OrderStatus;
import com.hospitalmgmt.ops.entity.Product;
import com.hospitalmgmt.ops.entity.Role;
import com.hospitalmgmt.ops.entity.UserAccount;
import com.hospitalmgmt.ops.exception.ApiException;
import com.hospitalmgmt.ops.repository.CustomerOrderRepository;
import com.hospitalmgmt.ops.repository.InvoiceRepository;
import com.hospitalmgmt.ops.repository.ProductRepository;
import com.hospitalmgmt.ops.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final UserAccountRepository userAccountRepository;
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final BillingProperties billingProperties;

    public List<OrderResponse> listOrdersForCurrentUser() {
        UserAccount actor = currentUser();
        if (actor.getRole() == Role.ADMIN || actor.getRole() == Role.STAFF) {
            return orderRepository.findAllOrdersNewestFirst().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return orderRepository.findByCustomer_IdOrderByCreatedAtDesc(actor.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrder(Long id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        assertCanViewOrder(order);
        return toResponse(order);
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public OrderResponse createOrder(CreateOrderRequest request) {
        UserAccount customer = currentUser();
        if (customer.getRole() != Role.CUSTOMER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only customer accounts can place orders");
        }
        Map<Long, Integer> qtyByProduct = new HashMap<>();
        for (var line : request.getLines()) {
            qtyByProduct.merge(line.getProductId(), line.getQuantity(), Integer::sum);
        }
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> e : qtyByProduct.entrySet()) {
            Product product = productRepository.findById(e.getKey())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Unknown product id: " + e.getKey()));
            if (!Boolean.TRUE.equals(product.getActive())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Product is not available: " + product.getSku());
            }
            int qty = e.getValue();
            if (product.getStockQuantity() < qty) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName() + " (available: " + product.getStockQuantity() + ")");
            }
            BigDecimal unit = product.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(qty)).setScale(2, RoundingMode.HALF_UP);
            total = total.add(lineTotal);
            OrderItem oi = OrderItem.builder()
                    .product(product)
                    .quantity(qty)
                    .unitPrice(unit)
                    .lineTotal(lineTotal)
                    .build();
            items.add(oi);
        }
        String orderNumber = "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(total.setScale(2, RoundingMode.HALF_UP))
                .createdAt(Instant.now())
                .items(new ArrayList<>())
                .build();
        for (OrderItem oi : items) {
            oi.setOrder(order);
            order.getItems().add(oi);
        }
        orderRepository.save(order);
        for (OrderItem oi : order.getItems()) {
            Product p = oi.getProduct();
            p.setStockQuantity(p.getStockQuantity() - oi.getQuantity());
            productRepository.save(p);
        }
        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal tax = subtotal.multiply(billingProperties.getTaxRate()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalDue = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);
        String invNo = "INV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        Instant due = order.getCreatedAt().plus(billingProperties.getInvoiceDueDays(), ChronoUnit.DAYS);
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invNo)
                .order(order)
                .subtotal(subtotal)
                .taxAmount(tax)
                .totalDue(totalDue)
                .status(InvoiceStatus.ISSUED)
                .issuedAt(Instant.now())
                .dueAt(due)
                .build();
        order.setInvoice(invoice);
        invoiceRepository.save(invoice);
        orderRepository.save(order);
        return toResponse(orderRepository.findById(order.getId()).orElse(order));
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        UserAccount actor = currentUser();
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.STAFF) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Insufficient privileges");
        }
        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    private UserAccount currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
    }

    private void assertCanViewOrder(CustomerOrder order) {
        UserAccount actor = currentUser();
        if (actor.getRole() == Role.ADMIN || actor.getRole() == Role.STAFF) {
            return;
        }
        if (!order.getCustomer().getId().equals(actor.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot access this order");
        }
    }

    private OrderResponse toResponse(CustomerOrder o) {
        List<OrderItemResponse> itemDtos = o.getItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .productId(oi.getProduct().getId())
                        .productName(oi.getProduct().getName())
                        .sku(oi.getProduct().getSku())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .lineTotal(oi.getLineTotal())
                        .build())
                .collect(Collectors.toList());
        String inv = o.getInvoice() != null ? o.getInvoice().getInvoiceNumber() : null;
        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .customerUserId(o.getCustomer().getId())
                .customerUsername(o.getCustomer().getUsername())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .createdAt(o.getCreatedAt())
                .items(itemDtos)
                .invoiceNumber(inv)
                .build();
    }
}
