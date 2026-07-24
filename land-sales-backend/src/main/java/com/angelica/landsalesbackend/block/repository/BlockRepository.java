package com.angelica.landsalesbackend.block.repository;

import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.lotification.dto.MapBlockResponse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlockRepository extends JpaRepository<LandBlock, Long> {

    @Query("select count(b) > 0 from LandBlock b where b.lotification.id = :lotificationId and upper(b.code) = :code")
    boolean existsByLotification_IdAndCode(@Param("lotificationId") Long lotificationId, @Param("code") String code);

    @Query("select count(b) > 0 from LandBlock b where b.lotification.id = :lotificationId and upper(b.code) = :code and b.id <> :id")
    boolean existsByLotification_IdAndCodeAndIdNot(@Param("lotificationId") Long lotificationId, @Param("code") String code, @Param("id") Long id);

    @Query("""
            select new com.angelica.landsalesbackend.block.dto.BlockResponse(
                b.id, b.lotification.id, b.lotification.name, b.code, b.areaM2,
                b.lotCount, count(l.id), b.notes, b.createdAt, b.updatedAt
            )
            from LandBlock b
            left join b.lots l
            where (:lotificationId is null or b.lotification.id = :lotificationId)
            group by b.id, b.lotification.id, b.lotification.name, b.code, b.areaM2,
                     b.lotCount, b.notes, b.createdAt, b.updatedAt
            order by b.code asc
            """)
    List<BlockResponse> findBlocks(@Param("lotificationId") Long lotificationId);

    @Query("""
            select new com.angelica.landsalesbackend.block.dto.BlockResponse(
                b.id, b.lotification.id, b.lotification.name, b.code, b.areaM2,
                b.lotCount, count(l.id), b.notes, b.createdAt, b.updatedAt
            )
            from LandBlock b
            left join b.lots l
            where b.id = :id
            group by b.id, b.lotification.id, b.lotification.name, b.code, b.areaM2,
                     b.lotCount, b.notes, b.createdAt, b.updatedAt
            """)
    java.util.Optional<BlockResponse> findBlockResponseById(@Param("id") Long id);

    @Query("""
            select new com.angelica.landsalesbackend.lotification.dto.MapBlockResponse(
                b.id,
                b.code,
                b.referenceColor
            )
            from LandBlock b
            where b.lotification.id = :lotificationId
            order by b.code asc
            """)
    List<MapBlockResponse> findMapBlocks(@Param("lotificationId") Long lotificationId);
}
