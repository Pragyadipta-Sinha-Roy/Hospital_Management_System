package com.hospitalmgmt.ops.service;

import com.hospitalmgmt.ops.dto.AuthResponse;
import com.hospitalmgmt.ops.dto.LoginRequest;
import com.hospitalmgmt.ops.dto.RegisterRequest;
import com.hospitalmgmt.ops.entity.CustomerProfile;
import com.hospitalmgmt.ops.entity.Role;
import com.hospitalmgmt.ops.entity.UserAccount;
import com.hospitalmgmt.ops.exception.ApiException;
import com.hospitalmgmt.ops.repository.UserAccountRepository;
import com.hospitalmgmt.ops.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        UserAccount user = UserAccount.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .build();
        CustomerProfile profile = CustomerProfile.builder()
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();
        user.setProfile(profile);
        userAccountRepository.save(user);
        return buildAuthResponse(user, jwtService.generateToken(userDetailsService.loadUserByUsername(user.getUsername())));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        UserAccount user = userAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        String token = jwtService.generateToken(userDetailsService.loadUserByUsername(user.getUsername()));
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(UserAccount user, String token) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
