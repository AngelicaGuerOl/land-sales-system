package com.angelica.landsalesbackend.customer.service;

import com.angelica.landsalesbackend.customer.dto.ChangeCustomerStatusRequest;
import com.angelica.landsalesbackend.customer.dto.CreateCustomerRequest;
import com.angelica.landsalesbackend.customer.dto.CustomerPageResponse;
import com.angelica.landsalesbackend.customer.dto.CustomerResponse;
import com.angelica.landsalesbackend.customer.dto.UpdateCustomerRequest;

public interface CustomerService {
    CustomerPageResponse findCustomers(int page, int size, String search, Boolean active);
    CustomerResponse getCustomer(Long id);
    CustomerResponse createCustomer(CreateCustomerRequest request);
    CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request);
    CustomerResponse changeStatus(Long id, ChangeCustomerStatusRequest request);
}
