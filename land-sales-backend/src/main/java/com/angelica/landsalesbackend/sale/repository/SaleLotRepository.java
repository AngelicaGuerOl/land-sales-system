package com.angelica.landsalesbackend.sale.repository;

import com.angelica.landsalesbackend.sale.entity.SaleLot;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleLotRepository extends JpaRepository<SaleLot, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select sl from SaleLot sl join fetch sl.sale s join fetch s.customer c join fetch sl.lot l where sl.id in :ids")
    List<SaleLot> findAllByIdInForUpdate(@Param("ids") Collection<Long> ids);
}
