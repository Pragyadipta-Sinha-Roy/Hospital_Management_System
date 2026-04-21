package com.hospitalmgmt.ops.bootstrap;

import com.hospitalmgmt.ops.entity.Product;
import com.hospitalmgmt.ops.entity.Role;
import com.hospitalmgmt.ops.entity.UserAccount;
import com.hospitalmgmt.ops.repository.ProductRepository;
import com.hospitalmgmt.ops.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
    }

    private void seedUsers() {
        if (!userAccountRepository.existsByUsername("admin")) {
            UserAccount admin = UserAccount.builder()
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("Admin#12345"))
                    .role(Role.ADMIN)
                    .build();
            userAccountRepository.save(admin);
            log.info("Seeded default admin user (admin / Admin#12345)");
        }
        if (!userAccountRepository.existsByUsername("staff")) {
            UserAccount staff = UserAccount.builder()
                    .username("staff")
                    .email("staff@example.com")
                    .password(passwordEncoder.encode("Staff#12345"))
                    .role(Role.STAFF)
                    .build();
            userAccountRepository.save(staff);
            log.info("Seeded default staff user (staff / Staff#12345)");
        }
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }
        productRepository.save(Product.builder()
                .sku("MED-GLV-100")
                .name("Nitrile Examination Gloves (box)")
                .description("Powder-free, latex-free, 100 count.")
                .price(new BigDecimal("24.99"))
                .stockQuantity(500)
                .category("Consumables")
                .active(true)
                .build());
        productRepository.save(Product.builder()
                .sku("MED-MASK-N95")
                .name("N95 Respirator Masks (box of 20)")
                .description("NIOSH-approved particulate respirator.")
                .price(new BigDecimal("45.00"))
                .stockQuantity(200)
                .category("PPE")
                .active(true)
                .build());
        productRepository.save(Product.builder()
                .sku("MED-SYR-5")
                .name("Sterile Syringes 5ml (pack of 50)")
                .description("Single-use sterile syringes.")
                .price(new BigDecimal("32.50"))
                .stockQuantity(150)
                .category("Instruments")
                .active(true)
                .build());
        log.info("Seeded sample products");
    }
}
