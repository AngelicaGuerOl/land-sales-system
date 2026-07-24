package com.angelica.landsalesbackend.block.repository;

import com.angelica.landsalesbackend.block.dto.BlockResponse;
import com.angelica.landsalesbackend.block.entity.LandBlock;
import com.angelica.landsalesbackend.lotification.dto.MapBlockResponse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlockRepository extends JpaRepository<LandBlock, Long> {

    @Query("""
            select new com.angelica.landsalesbackend.block.dto.BlockResponse(
                b.id,
                b.lotification.id,
                b.code,
                b.areaM2,
                b.lotCount,
                b.referenceColor
            )
            from LandBlock b
            where (:lotificationId is null or b.lotification.id = :lotificationId)
            order by b.code asc
            """)
    List<BlockResponse> findBlocks(@Param("lotificationId") Long lotificationId);

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
