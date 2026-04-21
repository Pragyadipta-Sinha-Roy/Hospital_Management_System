package com.hospitalmgmt.ops.service;

import com.hospitalmgmt.ops.dto.ProductRequest;
import com.hospitalmgmt.ops.dto.ProductResponse;
import com.hospitalmgmt.ops.entity.Product;
import com.hospitalmgmt.ops.exception.ApiException;
import com.hospitalmgmt.ops.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable(value = "products", key = "'list:' + (#q == null ? '' : #q) + ':' + (#category == null ? '' : #category)")
    public List<ProductResponse> search(String q, String category) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        String cat = (category == null || category.isBlank()) ? null : category.trim();
        if (query == null && cat == null) {
            return productRepository.findByActiveTrueOrderByNameAsc().stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        String qParam = query == null ? "" : query;
        return productRepository.searchActive(qParam, cat).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "products", key = "'id:' + #id")
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return toResponse(p);
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySkuIgnoreCase(request.getSku().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "SKU already exists");
        }
        Product p = Product.builder()
                .sku(request.getSku().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .active(request.getActive())
                .build();
        return toResponse(productRepository.save(p));
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (productRepository.existsBySkuIgnoreCaseAndIdNot(request.getSku().trim(), id)) {
            throw new ApiException(HttpStatus.CONFLICT, "SKU already exists");
        }
        p.setSku(request.getSku().trim());
        p.setName(request.getName().trim());
        p.setDescription(request.getDescription());
        p.setPrice(request.getPrice());
        p.setStockQuantity(request.getStockQuantity());
        p.setCategory(request.getCategory());
        p.setActive(request.getActive());
        return toResponse(productRepository.save(p));
    }

    @CacheEvict(value = "products", allEntries = true)
    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }

    public Product getEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .category(p.getCategory())
                .active(p.getActive())
                .build();
    }
}
