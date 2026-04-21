package com.hospitalmgmt.ops.repository;

import com.hospitalmgmt.ops.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
            AND (:q IS NULL OR :q = ''
                OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%'))
                OR (p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%'))))
            AND (:category IS NULL OR p.category = :category)
            ORDER BY p.name
            """)
    List<Product> searchActive(@Param("q") String q, @Param("category") String category);

    List<Product> findByActiveTrueOrderByNameAsc();
}
