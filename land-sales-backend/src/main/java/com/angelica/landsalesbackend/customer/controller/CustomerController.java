package com.angelica.landsalesbackend.customer.controller;

import com.angelica.landsalesbackend.customer.dto.ChangeCustomerStatusRequest;
import com.angelica.landsalesbackend.customer.dto.CreateCustomerRequest;
import com.angelica.landsalesbackend.customer.dto.CustomerPageResponse;
import com.angelica.landsalesbackend.customer.dto.CustomerResponse;
import com.angelica.landsalesbackend.customer.dto.UpdateCustomerRequest;
import com.angelica.landsalesbackend.customer.service.CustomerService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<CustomerPageResponse> findCustomers(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "25") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(customerService.findCustomers(page, size, search, active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomer(id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CustomerResponse> changeStatus(@PathVariable Long id, @Valid @RequestBody ChangeCustomerStatusRequest request) {
        return ResponseEntity.ok(customerService.changeStatus(id, request));
    }
}
