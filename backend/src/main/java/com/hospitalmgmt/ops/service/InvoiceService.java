package com.hospitalmgmt.ops.service;

import com.hospitalmgmt.ops.dto.InvoiceResponse;
import com.hospitalmgmt.ops.entity.Invoice;
import com.hospitalmgmt.ops.entity.Role;
import com.hospitalmgmt.ops.entity.UserAccount;
import com.hospitalmgmt.ops.exception.ApiException;
import com.hospitalmgmt.ops.repository.InvoiceRepository;
import com.hospitalmgmt.ops.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserAccountRepository userAccountRepository;

    public List<InvoiceResponse> listInvoices() {
        UserAccount actor = currentUser();
        if (actor.getRole() == Role.ADMIN || actor.getRole() == Role.STAFF) {
            return invoiceRepository.findAllSortedByIssuedAt().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        return invoiceRepository.findByOrder_Customer_IdOrderByIssuedAtDesc(actor.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InvoiceResponse getInvoice(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invoice not found"));
        assertCanView(inv);
        return toResponse(inv);
    }

    private void assertCanView(Invoice inv) {
        UserAccount actor = currentUser();
        if (actor.getRole() == Role.ADMIN || actor.getRole() == Role.STAFF) {
            return;
        }
        if (!inv.getOrder().getCustomer().getId().equals(actor.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot access this invoice");
        }
    }

    private UserAccount currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
    }

    private InvoiceResponse toResponse(Invoice inv) {
        return InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .orderId(inv.getOrder().getId())
                .orderNumber(inv.getOrder().getOrderNumber())
                .subtotal(inv.getSubtotal())
                .taxAmount(inv.getTaxAmount())
                .totalDue(inv.getTotalDue())
                .status(inv.getStatus())
                .issuedAt(inv.getIssuedAt())
                .dueAt(inv.getDueAt())
                .build();
    }
}
