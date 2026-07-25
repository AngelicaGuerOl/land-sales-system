package com.angelica.landsalesbackend.sale.repository;

import com.angelica.landsalesbackend.sale.entity.SaleInstallment;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleInstallmentRepository extends JpaRepository<SaleInstallment, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from SaleInstallment i join fetch i.saleLot sl where sl.id in :saleLotIds order by sl.id, i.paymentMonth, i.installmentNumber")
    List<SaleInstallment> findAllBySaleLotIdInForUpdate(@Param("saleLotIds") Collection<Long> saleLotIds);
}
