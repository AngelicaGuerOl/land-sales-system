package com.angelica.landsalesbackend.sale;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.customer.repository.CustomerRepository;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lot.repository.LotRepository;
import com.angelica.landsalesbackend.sale.dto.CreateSaleLotRequest;
import com.angelica.landsalesbackend.sale.dto.CreateSaleRequest;
import com.angelica.landsalesbackend.sale.entity.SaleInstallment;
import com.angelica.landsalesbackend.sale.entity.SaleInstallmentStatus;
import com.angelica.landsalesbackend.sale.mapper.SaleMapper;
import com.angelica.landsalesbackend.sale.repository.SaleRepository;
import com.angelica.landsalesbackend.sale.service.SaleServiceImpl;
import com.angelica.landsalesbackend.security.AuthenticatedUser;
import com.angelica.landsalesbackend.user.entity.User;
import com.angelica.landsalesbackend.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SaleServiceImplTest {
    private final SaleRepository saleRepository = mock(SaleRepository.class);
    private final CustomerRepository customerRepository = mock(CustomerRepository.class);
    private final LotRepository lotRepository = mock(LotRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final SaleMapper saleMapper = mock(SaleMapper.class);
    private SaleServiceImpl service;
    private Lot lot;

    @BeforeEach void setUp() {
        service = new SaleServiceImpl(saleRepository, customerRepository, lotRepository, userRepository, saleMapper);
        Customer customer = new Customer(); customer.setFullName("Test Customer"); customer.setPhone("7711234567"); customer.setActive(true);
        User user = new User(); user.setId(9L); user.setUsername("admin"); user.setFullName("Admin");
        LandBlock block = new LandBlock(); block.setId(2L); block.setCode("MZA-01");
        lot = new Lot(); lot.setId(10L); lot.setCode("MZA-01-L-01"); lot.setLotNumber("L-01"); lot.setBlock(block); lot.setStatus(LotStatus.AVAILABLE); lot.setAreaM2(new BigDecimal("100.00"));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer)); when(userRepository.findById(9L)).thenReturn(Optional.of(user)); when(lotRepository.findAllByIdInForUpdate(List.of(10L))).thenReturn(List.of(lot)); when(saleRepository.nextFolioSequence()).thenReturn(1L); when(saleRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(saleMapper.toInstallmentResponse(any(SaleInstallment.class))).thenAnswer(invocation -> {
            SaleInstallment installment = invocation.getArgument(0);
            return new com.angelica.landsalesbackend.sale.dto.SaleInstallmentResponse(installment.getInstallmentNumber(), installment.getPaymentMonth(), installment.getAmount(), installment.getPaidAmount(), SaleInstallmentStatus.PENDING);
        });
    }

    @Test void createsInstallmentsWithLastPaymentAbsorbingRounding() {
        CreateSaleRequest request = new CreateSaleRequest(1L, LocalDate.of(2026, 6, 24), List.of(new CreateSaleLotRequest(10L, new BigDecimal("100000"), BigDecimal.ZERO, 3)));
        var response = service.create(request, new AuthenticatedUser(9L, "admin"));
        assertEquals("VTA-2026-000001", response.folio()); assertEquals(LotStatus.SOLD, lot.getStatus()); assertEquals(new BigDecimal("100000.00"), response.totalFinancedAmount()); assertEquals(LocalDate.of(2026, 7, 1), response.lots().get(0).firstPaymentMonth());
        assertEquals(new BigDecimal("33333.33"), response.lots().get(0).installments().get(0).amount()); assertEquals(new BigDecimal("33333.34"), response.lots().get(0).installments().get(2).amount());
        assertTrue(response.lots().get(0).installments().stream().allMatch(installment -> installment.status() == SaleInstallmentStatus.PENDING));
    }

    @Test void decemberSaleStartsPaymentsInJanuaryOfNextYear() {
        CreateSaleRequest request = new CreateSaleRequest(1L, LocalDate.of(2026, 12, 15), List.of(new CreateSaleLotRequest(10L, new BigDecimal("1200"), BigDecimal.ZERO, 2)));
        var response = service.create(request, new AuthenticatedUser(9L, "admin"));
        assertEquals(LocalDate.of(2027, 1, 1), response.lots().get(0).installments().get(0).paymentMonth());
        assertEquals(LocalDate.of(2027, 2, 1), response.lots().get(0).installments().get(1).paymentMonth());
    }

    @Test void fullyPaidLotDoesNotCreateInstallments() {
        CreateSaleRequest request = new CreateSaleRequest(1L, LocalDate.of(2026, 7, 24), List.of(new CreateSaleLotRequest(10L, new BigDecimal("100000"), new BigDecimal("100000"), 0)));
        var response = service.create(request, new AuthenticatedUser(9L, "admin"));
        assertEquals(0, response.lots().get(0).installments().size()); assertEquals("PAID", response.lots().get(0).status().name());
    }
}
