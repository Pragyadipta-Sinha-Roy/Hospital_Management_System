package com.hospitalmgmt.ops.repository;

import com.hospitalmgmt.ops.entity.Invoice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByOrder_Id(Long orderId);

    @EntityGraph(attributePaths = {"order", "order.customer"})
    @Override
    Optional<Invoice> findById(Long id);

    @EntityGraph(attributePaths = {"order", "order.customer"})
    @Query("SELECT i FROM Invoice i ORDER BY i.issuedAt DESC")
    List<Invoice> findAllSortedByIssuedAt();

    @EntityGraph(attributePaths = {"order", "order.customer"})
    List<Invoice> findByOrder_Customer_IdOrderByIssuedAtDesc(Long customerUserId);
}
