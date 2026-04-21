package com.hospitalmgmt.ops.service;

import com.hospitalmgmt.ops.dto.CustomerProfileRequest;
import com.hospitalmgmt.ops.dto.CustomerSummaryResponse;
import com.hospitalmgmt.ops.entity.Role;
import com.hospitalmgmt.ops.entity.UserAccount;
import com.hospitalmgmt.ops.exception.ApiException;
import com.hospitalmgmt.ops.repository.CustomerProfileRepository;
import com.hospitalmgmt.ops.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserAccountRepository userAccountRepository;
    private final CustomerProfileRepository customerProfileRepository;

    public CustomerSummaryResponse getCurrentProfile() {
        UserAccount user = currentUser();
        return customerProfileRepository.findByUserUsername(user.getUsername())
                .map(p -> CustomerSummaryResponse.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .phone(p.getPhone())
                        .address(p.getAddress())
                        .build())
                .orElseGet(() -> CustomerSummaryResponse.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build());
    }

    @Transactional
    public CustomerSummaryResponse updateProfile(CustomerProfileRequest request) {
        UserAccount user = currentUser();
        var profile = customerProfileRepository.findByUserUsername(user.getUsername())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "No customer profile for this account"));
        profile.setFirstName(request.getFirstName().trim());
        profile.setLastName(request.getLastName().trim());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        customerProfileRepository.save(profile);
        return getCurrentProfile();
    }

    public List<CustomerSummaryResponse> listCustomers() {
        UserAccount actor = currentUser();
        if (actor.getRole() != Role.ADMIN && actor.getRole() != Role.STAFF) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Insufficient privileges");
        }
        return userAccountRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .map(u -> customerProfileRepository.findByUserUsername(u.getUsername())
                        .map(p -> CustomerSummaryResponse.builder()
                                .userId(u.getId())
                                .username(u.getUsername())
                                .email(u.getEmail())
                                .role(u.getRole())
                                .firstName(p.getFirstName())
                                .lastName(p.getLastName())
                                .phone(p.getPhone())
                                .address(p.getAddress())
                                .build())
                        .orElse(CustomerSummaryResponse.builder()
                                .userId(u.getId())
                                .username(u.getUsername())
                                .email(u.getEmail())
                                .role(u.getRole())
                                .build()))
                .collect(Collectors.toList());
    }

    private UserAccount currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
    }
}
