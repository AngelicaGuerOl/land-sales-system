package com.angelica.landsalesbackend.accountstatement.controller;

import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementResponse;
import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementSummaryResponse;
import com.angelica.landsalesbackend.accountstatement.service.AccountStatementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account-statements")
public class AccountStatementController {
    private final AccountStatementService service;
    public AccountStatementController(AccountStatementService service) { this.service = service; }
    @GetMapping("/customers")
    public Page<AccountStatementSummaryResponse> findCustomers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size, @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100));
        return service.findCustomers(search, pageable);
    }
    @GetMapping("/customers/{customerId}")
    public AccountStatementResponse getCustomerStatement(@PathVariable Long customerId) { return service.getCustomerStatement(customerId); }
}
