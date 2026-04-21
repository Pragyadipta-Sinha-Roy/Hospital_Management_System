package com.hospitalmgmt.ops.dto;

import com.hospitalmgmt.ops.entity.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalDue;
    private InvoiceStatus status;
    private Instant issuedAt;
    private Instant dueAt;
}
