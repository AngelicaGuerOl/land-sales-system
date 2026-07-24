package com.angelica.landsalesbackend.customer.service;

import com.angelica.landsalesbackend.customer.dto.ChangeCustomerStatusRequest;
import com.angelica.landsalesbackend.customer.dto.CreateCustomerRequest;
import com.angelica.landsalesbackend.customer.dto.CustomerPageResponse;
import com.angelica.landsalesbackend.customer.dto.CustomerResponse;
import com.angelica.landsalesbackend.customer.dto.UpdateCustomerRequest;
import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.exception.CustomerNotFoundException;
import com.angelica.landsalesbackend.customer.mapper.CustomerMapper;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerServiceImpl(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerPageResponse findCustomers(int page, int size, String search, Boolean active) {
        Page<Customer> result = customerRepository.search(
                normalizeSearch(search),
                active,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "fullName"))
        );
        List<CustomerResponse> content = result.getContent().stream().map(customerMapper::toResponse).toList();
        return new CustomerPageResponse(content, result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(), result.isFirst(), result.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(Long id) {
        return customerMapper.toResponse(findCustomer(id));
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        Customer customer = customerMapper.toEntity(normalize(request));
        customer.setActive(true);
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = findCustomer(id);
        customerMapper.updateEntity(normalize(request), customer);
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse changeStatus(Long id, ChangeCustomerStatusRequest request) {
        Customer customer = findCustomer(id);
        customer.setActive(request.active());
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id).orElseThrow(CustomerNotFoundException::new);
    }

    private CreateCustomerRequest normalize(CreateCustomerRequest request) {
        return new CreateCustomerRequest(trimRequired(request.fullName()), trimRequired(request.phone()), normalizeOptional(request.alternatePhone()), normalizeOptional(request.address()));
    }

    private UpdateCustomerRequest normalize(UpdateCustomerRequest request) {
        return new UpdateCustomerRequest(trimRequired(request.fullName()), trimRequired(request.phone()), normalizeOptional(request.alternatePhone()), normalizeOptional(request.address()));
    }

    private String trimRequired(String value) {
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeSearch(String value) {
        return value == null ? "" : value.trim();
    }
}
