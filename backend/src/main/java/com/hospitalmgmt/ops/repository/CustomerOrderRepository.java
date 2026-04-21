package com.hospitalmgmt.ops.repository;

import com.hospitalmgmt.ops.entity.CustomerOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    @Override
    @EntityGraph(attributePaths = {"items", "items.product", "customer", "invoice"})
    Optional<CustomerOrder> findById(Long id);

    @EntityGraph(attributePaths = {"items", "items.product", "customer", "invoice"})
    List<CustomerOrder> findByCustomer_IdOrderByCreatedAtDesc(Long customerUserId);

    @EntityGraph(attributePaths = {"items", "items.product", "customer", "invoice"})
    @Query("SELECT o FROM CustomerOrder o ORDER BY o.createdAt DESC")
    List<CustomerOrder> findAllOrdersNewestFirst();
}
