package com.angelica.landsalesbackend.lot.repository;

import com.angelica.landsalesbackend.lot.dto.LotPriceHistoryResponse;
import com.angelica.landsalesbackend.lot.entity.LotPriceHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LotPriceHistoryRepository extends JpaRepository<LotPriceHistory, Long> {

    @Query("""
            select new com.angelica.landsalesbackend.lot.dto.LotPriceHistoryResponse(
                h.id,
                h.previousPrice,
                h.newPrice,
                h.reason,
                u.username,
                h.changedAt
            )
            from LotPriceHistory h
            join h.changedBy u
            where h.lot.id = :lotId
            order by h.changedAt desc, h.id desc
            """)
    List<LotPriceHistoryResponse> findResponsesByLotId(@Param("lotId") Long lotId);
}
