package com.hospitalmgmt.ops.repository;

import com.hospitalmgmt.ops.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findByUserUsername(String username);
}
