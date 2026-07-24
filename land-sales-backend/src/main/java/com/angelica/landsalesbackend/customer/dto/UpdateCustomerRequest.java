package com.angelica.landsalesbackend.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCustomerRequest(
        @NotBlank @Size(max = 150) String fullName,
        @NotBlank @Size(max = 20) @Pattern(regexp = "^(?=(?:\\D*\\d){1,10}\\D*$)[0-9+()\\-\\s]+$") String phone,
        @Size(max = 20) @Pattern(regexp = "^$|^(?=(?:\\D*\\d){1,10}\\D*$)[0-9+()\\-\\s]+$") String alternatePhone,
        @Size(max = 500) String address
) {
}
