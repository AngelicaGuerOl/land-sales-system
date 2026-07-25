package com.angelica.landsalesbackend.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.payment.dto.CreateInstallmentPaymentRequest;
import com.angelica.landsalesbackend.payment.dto.CreatePaymentAllocationRequest;
import com.angelica.landsalesbackend.payment.dto.CreatePaymentRequest;
import com.angelica.landsalesbackend.payment.entity.Payment;
import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import com.angelica.landsalesbackend.payment.repository.PaymentRepository;
import com.angelica.landsalesbackend.payment.service.PaymentServiceImpl;
import com.angelica.landsalesbackend.sale.entity.Sale;
import com.angelica.landsalesbackend.sale.entity.SaleInstallment;
import com.angelica.landsalesbackend.sale.entity.SaleInstallmentStatus;
import com.angelica.landsalesbackend.sale.entity.SaleLot;
import com.angelica.landsalesbackend.sale.entity.SaleLotStatus;
import com.angelica.landsalesbackend.sale.repository.SaleInstallmentRepository;
import com.angelica.landsalesbackend.sale.repository.SaleLotRepository;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PaymentServiceImplTest {
    private final PaymentRepository paymentRepository = org.mockito.Mockito.mock(PaymentRepository.class);
    private final CustomerRepository customerRepository = org.mockito.Mockito.mock(CustomerRepository.class);
    private final UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
    private final SaleLotRepository saleLotRepository = org.mockito.Mockito.mock(SaleLotRepository.class);
    private final SaleInstallmentRepository installmentRepository = org.mockito.Mockito.mock(SaleInstallmentRepository.class);
    private PaymentServiceImpl service;
    private SaleLot saleLot;
    private SaleInstallment installment;

    @BeforeEach
    void setUp() {
        service = new PaymentServiceImpl(paymentRepository, customerRepository, userRepository, saleLotRepository, installmentRepository);
        Customer customer = new Customer(); customer.setId(1L); customer.setFullName("Cliente de prueba"); customer.setPhone("7711234567"); customer.setActive(true);
        User user = new User(); user.setId(9L); user.setFullName("Administrador"); user.setUsername("admin");
        Sale sale = new Sale(); sale.setId(20L); sale.setCustomer(customer); sale.setSaleDate(LocalDate.now(ZoneId.systemDefault()));
        Lot lot = new Lot(); lot.setId(10L); lot.setCode("MZA-01-L-01");
        saleLot = new SaleLot(); saleLot.setId(30L); saleLot.setSale(sale); saleLot.setLot(lot); saleLot.setOutstandingBalance(new BigDecimal("10000.00")); saleLot.setStatus(SaleLotStatus.ACTIVE); sale.getSaleLots().add(saleLot);
        installment = new SaleInstallment(); installment.setId(40L); installment.setSaleLot(saleLot); installment.setInstallmentNumber(1); installment.setPaymentMonth(LocalDate.of(2026, 8, 1)); installment.setAmount(new BigDecimal("10000.00")); installment.setPaidAmount(new BigDecimal("0.00")); installment.setStatus(SaleInstallmentStatus.PENDING); saleLot.getInstallments().add(installment);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer)); when(userRepository.findById(9L)).thenReturn(Optional.of(user)); when(saleLotRepository.findAllByIdInForUpdate(List.of(30L))).thenReturn(List.of(saleLot)); when(installmentRepository.findAllBySaleLotIdInForUpdate(List.of(30L))).thenReturn(List.of(installment)); when(paymentRepository.nextPaymentNumber()).thenReturn(1L); when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createsFirstPaymentAndUpdatesPartialBalance() {
        var request = new CreatePaymentRequest(1L, PaymentMethod.CASH, null, List.of(new CreatePaymentAllocationRequest(30L, List.of(new CreateInstallmentPaymentRequest(40L, new BigDecimal("2500.00"))))));
        var response = service.create(request, new AuthenticatedUser(9L, "admin"));
        assertEquals(1L, response.paymentNumber()); assertEquals(new BigDecimal("2500.00"), response.totalAmount()); assertEquals(new BigDecimal("7500.00"), saleLot.getOutstandingBalance()); assertEquals(new BigDecimal("2500.00"), installment.getPaidAmount()); assertEquals(SaleInstallmentStatus.PARTIAL, installment.getStatus());
    }

    @Test
    void rejectsPaymentBeforeSaleDate() {
        saleLot.getSale().setSaleDate(LocalDate.now().plusDays(1));
        var request = new CreatePaymentRequest(1L, PaymentMethod.CASH, null, List.of(new CreatePaymentAllocationRequest(30L, List.of(new CreateInstallmentPaymentRequest(40L, new BigDecimal("2500.00"))))));
        var exception = assertThrows(com.angelica.landsalesbackend.payment.exception.PaymentValidationException.class, () -> service.create(request, new AuthenticatedUser(9L, "admin")));
        assertEquals("No se puede registrar un pago con fecha anterior a la venta del lote MZA-01-L-01.", exception.getMessage());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

}
