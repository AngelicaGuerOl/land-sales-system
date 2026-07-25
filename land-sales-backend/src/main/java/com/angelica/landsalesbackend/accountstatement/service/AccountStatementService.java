package com.angelica.landsalesbackend.accountstatement.service;

import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementResponse;
import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountStatementService {
    Page<AccountStatementSummaryResponse> findCustomers(String search, Pageable pageable);
    AccountStatementResponse getCustomerStatement(Long customerId);
}
