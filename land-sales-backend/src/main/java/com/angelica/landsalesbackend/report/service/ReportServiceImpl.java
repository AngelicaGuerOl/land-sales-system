package com.angelica.landsalesbackend.report.service;

import com.angelica.landsalesbackend.report.dto.ReportSummaryResponse;
import com.angelica.landsalesbackend.report.exception.ReportValidationException;
import com.angelica.landsalesbackend.report.repository.ReportRepository;
import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportServiceImpl implements ReportService {
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);
    private final ReportRepository reportRepository;

    public ReportServiceImpl(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryResponse summarize(LocalDate dateFrom, LocalDate dateTo) {
        if (dateFrom == null || dateTo == null) {
            throw new ReportValidationException("Las fechas inicial y final son obligatorias.");
        }
        if (dateFrom.isAfter(dateTo)) {
            throw new ReportValidationException("La fecha inicial no puede ser posterior a la fecha final.");
        }

        Object[] sales = firstRow(reportRepository.summarizeSales(dateFrom, dateTo, SaleStatus.CANCELLED), 4);
        Object[] soldLots = firstRow(reportRepository.summarizeSoldLots(dateFrom, dateTo, SaleStatus.CANCELLED), 2);
        BigDecimal laterPayments = money(reportRepository.sumPayments(dateFrom, dateTo));
        BigDecimal downPayment = money(sales[2]);

        return new ReportSummaryResponse(
                dateFrom,
                dateTo,
                number(sales[0]),
                number(soldLots[0]),
                money(sales[1]),
                downPayment,
                money(sales[3]),
                laterPayments,
                downPayment.add(laterPayments).setScale(2),
                money(soldLots[1]),
                reportRepository.summarizeByBlock(dateFrom, dateTo, SaleStatus.CANCELLED).stream()
                        .map(row -> new ReportSummaryResponse.BlockSummary((String) row[0], number(row[1]), money(row[2])))
                        .toList()
        );
    }

    private long number(Object value) {
        return ((Number) value).longValue();
    }

    private Object[] firstRow(List<Object[]> rows, int expectedColumns) {
        if (rows.isEmpty()) {
            return new Object[expectedColumns];
        }
        return rows.get(0);
    }

    private BigDecimal money(Object value) {
        return value == null ? ZERO : new BigDecimal(value.toString()).setScale(2);
    }
}
