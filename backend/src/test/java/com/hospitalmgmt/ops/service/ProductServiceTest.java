package com.hospitalmgmt.ops.service;

import com.hospitalmgmt.ops.dto.ProductRequest;
import com.hospitalmgmt.ops.dto.ProductResponse;
import com.hospitalmgmt.ops.entity.Product;
import com.hospitalmgmt.ops.exception.ApiException;
import com.hospitalmgmt.ops.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sample;

    @BeforeEach
    void setUp() {
        sample = Product.builder()
                .id(1L)
                .sku("SKU-1")
                .name("Item")
                .description("d")
                .price(new BigDecimal("10.00"))
                .stockQuantity(5)
                .category("c")
                .active(true)
                .build();
    }

    @Test
    void getById_returnsMappedProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sample));
        ProductResponse r = productService.getById(1L);
        assertThat(r.getSku()).isEqualTo("SKU-1");
        assertThat(r.getName()).isEqualTo("Item");
    }

    @Test
    void getById_throwsWhenMissing() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void create_persistsProduct() {
        when(productRepository.existsBySkuIgnoreCase("NEW-SKU")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });
        ProductRequest req = new ProductRequest();
        req.setSku("NEW-SKU");
        req.setName("New");
        req.setDescription("x");
        req.setPrice(new BigDecimal("1.00"));
        req.setStockQuantity(1);
        req.setCategory("c");
        req.setActive(true);
        ProductResponse r = productService.create(req);
        assertThat(r.getId()).isEqualTo(2L);
        assertThat(r.getSku()).isEqualTo("NEW-SKU");
    }
}
