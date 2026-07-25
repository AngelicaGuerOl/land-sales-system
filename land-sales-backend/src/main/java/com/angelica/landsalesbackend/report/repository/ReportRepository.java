package com.angelica.landsalesbackend.report.repository;

import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import com.angelica.landsalesbackend.sale.entity.Sale;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends Repository<Sale, Long> {
    @Query("""
            select count(s.id), coalesce(sum(s.totalAgreedPrice), 0),
                   coalesce(sum(s.totalDownPayment), 0), coalesce(sum(s.totalFinancedAmount), 0)
            from Sale s
            where s.saleDate between :dateFrom and :dateTo and s.status <> :excludedStatus
            """)
    List<Object[]> summarizeSales(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo, @Param("excludedStatus") SaleStatus excludedStatus);

    @Query("""
            select count(sl.id), coalesce(sum(sl.outstandingBalance), 0)
            from SaleLot sl join sl.sale s
            where s.saleDate between :dateFrom and :dateTo and s.status <> :excludedStatus
            """)
    List<Object[]> summarizeSoldLots(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo, @Param("excludedStatus") SaleStatus excludedStatus);

    @Query("""
            select l.block.code, count(sl.id), coalesce(sum(sl.agreedPrice), 0)
            from SaleLot sl join sl.sale s join sl.lot l
            where s.saleDate between :dateFrom and :dateTo and s.status <> :excludedStatus
            group by l.block.code
            order by l.block.code
            """)
    List<Object[]> summarizeByBlock(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo, @Param("excludedStatus") SaleStatus excludedStatus);

    @Query("select coalesce(sum(p.totalAmount), 0) from Payment p where p.paymentDate between :dateFrom and :dateTo")
    java.math.BigDecimal sumPayments(@Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo);
}
