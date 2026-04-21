package com.hospitalmgmt.ops.dto;

import com.hospitalmgmt.ops.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryResponse {

    private Long userId;
    private String username;
    private String email;
    private Role role;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
}
