package com.hospitalmgmt.ops.controller;

import com.hospitalmgmt.ops.dto.CustomerProfileRequest;
import com.hospitalmgmt.ops.dto.CustomerSummaryResponse;
import com.hospitalmgmt.ops.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/me")
    public CustomerSummaryResponse me() {
        return customerService.getCurrentProfile();
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CustomerSummaryResponse updateMe(@Valid @RequestBody CustomerProfileRequest request) {
        return customerService.updateProfile(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<CustomerSummaryResponse> list() {
        return customerService.listCustomers();
    }
}
