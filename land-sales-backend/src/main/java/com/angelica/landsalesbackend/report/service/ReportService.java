package com.angelica.landsalesbackend.report.service;

import com.angelica.landsalesbackend.report.dto.ReportSummaryResponse;
import java.time.LocalDate;

public interface ReportService {
    ReportSummaryResponse summarize(LocalDate dateFrom, LocalDate dateTo);
}
