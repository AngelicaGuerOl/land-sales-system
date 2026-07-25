package com.angelica.landsalesbackend.sale.repository;

import com.angelica.landsalesbackend.sale.entity.Sale;
import com.angelica.landsalesbackend.sale.entity.SaleStatus;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    @Query(value = """
            select distinct s from Sale s
            join s.customer c left join s.saleLots sl left join sl.lot l
            where (:status is null or s.status = :status)
              and (:dateFrom is null or s.saleDate >= :dateFrom)
              and (:dateTo is null or s.saleDate <= :dateTo)
              and (:search = '' or lower(s.folio) like lower(concat('%', :search, '%'))
                   or lower(c.fullName) like lower(concat('%', :search, '%'))
                   or lower(c.phone) like lower(concat('%', :search, '%'))
                   or lower(coalesce(l.code, '')) like lower(concat('%', :search, '%')))
            """,
            countQuery = """
            select count(distinct s.id) from Sale s
            join s.customer c left join s.saleLots sl left join sl.lot l
            where (:status is null or s.status = :status)
              and (:dateFrom is null or s.saleDate >= :dateFrom)
              and (:dateTo is null or s.saleDate <= :dateTo)
              and (:search = '' or lower(s.folio) like lower(concat('%', :search, '%'))
                   or lower(c.fullName) like lower(concat('%', :search, '%'))
                   or lower(c.phone) like lower(concat('%', :search, '%'))
                   or lower(coalesce(l.code, '')) like lower(concat('%', :search, '%')))
            """)
    Page<Sale> search(@Param("search") String search, @Param("status") SaleStatus status, @Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo, Pageable pageable);

    @Query(value = "select nextval('sales_folio_seq')", nativeQuery = true)
    Long nextFolioSequence();

    @Query("select distinct s from Sale s join fetch s.customer c join fetch s.createdBy u left join fetch s.saleLots sl left join fetch sl.lot l where s.id = :id")
    Optional<Sale> findDetailById(@Param("id") Long id);
}
