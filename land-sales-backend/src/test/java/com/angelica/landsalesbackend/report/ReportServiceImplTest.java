package com.angelica.landsalesbackend.report;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.angelica.landsalesbackend.report.repository.ReportRepository;
import com.angelica.landsalesbackend.report.service.ReportServiceImpl;
import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ReportServiceImplTest {
    private final ReportRepository repository = org.mockito.Mockito.mock(ReportRepository.class);
    private ReportServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ReportServiceImpl(repository);
    }

    @Test
    void calculatesCollectedAmountWithoutDuplicatingDownPayment() {
        LocalDate from = LocalDate.of(2026, 7, 1);
        LocalDate to = LocalDate.of(2026, 7, 31);
        when(repository.summarizeSales(from, to, SaleStatus.CANCELLED)).thenReturn(List.<Object[]>of(new Object[]{2L, new BigDecimal("255000.00"), new BigDecimal("50000.00"), new BigDecimal("205000.00")}));
        when(repository.summarizeSoldLots(from, to, SaleStatus.CANCELLED)).thenReturn(List.<Object[]>of(new Object[]{2L, new BigDecimal("205000.00")}));
        when(repository.sumPayments(from, to)).thenReturn(new BigDecimal("10000.00"));
        when(repository.summarizeByBlock(from, to, SaleStatus.CANCELLED)).thenReturn(List.<Object[]>of(new Object[]{"MZA-01", 2L, new BigDecimal("255000.00")}));

        var response = service.summarize(from, to);

        assertEquals(new BigDecimal("60000.00"), response.totalCollectedAmount());
        assertEquals(2, response.salesCount());
        assertEquals(2, response.soldLotsCount());
        assertEquals(1, response.byBlock().size());
        verify(repository).sumPayments(from, to);
    }

    @Test
    void rejectsInvertedDateRange() {
        LocalDate from = LocalDate.of(2026, 8, 1);
        LocalDate to = LocalDate.of(2026, 7, 31);

        assertThrows(RuntimeException.class, () -> service.summarize(from, to));
    }
}
