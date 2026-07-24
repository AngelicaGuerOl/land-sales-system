package com.angelica.landsalesbackend.customer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.angelica.landsalesbackend.customer.dto.ChangeCustomerStatusRequest;
import com.angelica.landsalesbackend.customer.dto.CreateCustomerRequest;
import com.angelica.landsalesbackend.customer.dto.CustomerResponse;
import com.angelica.landsalesbackend.customer.dto.UpdateCustomerRequest;
import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.mapper.CustomerMapper;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import com.angelica.landsalesbackend.customer.service.CustomerServiceImpl;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock
    CustomerRepository customerRepository;

    @Mock
    CustomerMapper customerMapper;

    @Captor
    ArgumentCaptor<CreateCustomerRequest> createRequestCaptor;

    private CustomerServiceImpl service;
    private Customer customer;

    @BeforeEach
    void setUp() {
        service = new CustomerServiceImpl(customerRepository, customerMapper);
        customer = new Customer();
        customer.setFullName("Juan Hernández López");
        customer.setPhone("7711234567");
        customer.setActive(true);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createTrimsFieldsForcesActiveAndNormalizesEmptyOptionalValues() {
        CreateCustomerRequest request = new CreateCustomerRequest("  Juan Hernández López ", " 7711234567 ", " ", " ");
        when(customerMapper.toEntity(any(CreateCustomerRequest.class))).thenReturn(customer);
        when(customerMapper.toResponse(customer)).thenReturn(response(true));

        CustomerResponse result = service.createCustomer(request);

        verify(customerMapper).toEntity(createRequestCaptor.capture());
        assertThat(createRequestCaptor.getValue().fullName()).isEqualTo("Juan Hernández López");
        assertThat(createRequestCaptor.getValue().phone()).isEqualTo("7711234567");
        assertThat(createRequestCaptor.getValue().alternatePhone()).isNull();
        assertThat(createRequestCaptor.getValue().address()).isNull();
        assertThat(customer.isActive()).isTrue();
        assertThat(result.active()).isTrue();
    }

    @Test
    void updateDoesNotChangeActive() {
        customer.setActive(false);
        when(customerMapper.toResponse(customer)).thenReturn(response(false));

        service.updateCustomer(1L, new UpdateCustomerRequest("Updated", "7710000000", "", "Address"));

        verify(customerMapper).updateEntity(any(UpdateCustomerRequest.class), any(Customer.class));
        assertThat(customer.isActive()).isFalse();
    }

    @Test
    void changeStatusUpdatesOnlyActiveState() {
        when(customerMapper.toResponse(customer)).thenReturn(response(false));

        service.changeStatus(1L, new ChangeCustomerStatusRequest(false));

        assertThat(customer.isActive()).isFalse();
        verify(customerRepository).save(customer);
    }

    private CustomerResponse response(boolean active) {
        return new CustomerResponse(1L, customer.getFullName(), customer.getPhone(), null, null, active, LocalDateTime.now(), LocalDateTime.now());
    }
}
