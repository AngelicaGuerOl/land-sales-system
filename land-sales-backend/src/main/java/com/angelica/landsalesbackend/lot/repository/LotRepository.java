package com.angelica.landsalesbackend.lot.repository;

import com.angelica.landsalesbackend.lot.dto.LotResponse;
import com.angelica.landsalesbackend.lot.entity.Lot;
import com.angelica.landsalesbackend.lot.entity.LotStatus;
import com.angelica.landsalesbackend.lotification.dto.MapLotResponse;
import java.util.List;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface LotRepository extends JpaRepository<Lot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Lot l join fetch l.block b where l.id in :ids")
    List<Lot> findAllByIdInForUpdate(@Param("ids") Collection<Long> ids);

    long countByBlock_Id(Long blockId);

    List<Lot> findByBlock_IdAndLotNumberIn(Long blockId, Collection<String> lotNumbers);

    List<Lot> findByCodeIn(Collection<String> codes);

    boolean existsByBlock_IdAndLotNumber(Long blockId, String lotNumber);

    boolean existsByBlock_IdAndLotNumberAndIdNot(Long blockId, String lotNumber, Long id);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("""
            select new com.angelica.landsalesbackend.lot.dto.LotResponse(
                l.id,
                b.id,
                b.code,
                l.lotNumber,
                l.code,
                l.areaM2,
                l.frontMeters,
                l.depthMeters,
                l.currentPrice,
                l.status,
                l.locationReference,
                l.notes,
                l.version,
                s.svgPath,
                s.labelX,
                s.labelY,
                s.rotation
            )
            from Lot l
            join l.block b
            left join l.mapShape s
            where (:lotificationId is null or b.lotification.id = :lotificationId)
              and (:blockId is null or b.id = :blockId)
              and (:status is null or l.status = :status)
              and (
                    :search = ''
                    or lower(l.code) like lower(concat('%', :search, '%'))
                    or lower(l.lotNumber) like lower(concat('%', :search, '%'))
              )
            order by b.code asc, l.lotNumber asc
            """)
    List<LotResponse> findLots(
            @Param("lotificationId") Long lotificationId,
            @Param("blockId") Long blockId,
            @Param("status") LotStatus status,
            @Param("search") String search
    );

    @Query("""
            select new com.angelica.landsalesbackend.lot.dto.LotResponse(
                l.id,
                b.id,
                b.code,
                l.lotNumber,
                l.code,
                l.areaM2,
                l.frontMeters,
                l.depthMeters,
                l.currentPrice,
                l.status,
                l.locationReference,
                l.notes,
                l.version,
                s.svgPath,
                s.labelX,
                s.labelY,
                s.rotation
            )
            from Lot l
            join l.block b
            left join l.mapShape s
            where l.id = :id
            """)
    Optional<LotResponse> findLotResponseById(@Param("id") Long id);

    @Query("""
            select new com.angelica.landsalesbackend.lotification.dto.MapLotResponse(
                l.id,
                l.code,
                b.id,
                b.code,
                l.lotNumber,
                l.areaM2,
                l.frontMeters,
                l.depthMeters,
                l.currentPrice,
                l.status,
                s.svgPath,
                s.labelX,
                s.labelY,
                s.rotation
            )
            from Lot l
            join l.block b
            left join l.mapShape s
            where b.lotification.id = :lotificationId
            order by b.code asc, l.lotNumber asc
            """)
    List<MapLotResponse> findMapLots(@Param("lotificationId") Long lotificationId);
}
