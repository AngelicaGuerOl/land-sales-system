package com.angelica.landsalesbackend.payment.repository;

import com.angelica.landsalesbackend.payment.entity.Payment;
import com.angelica.landsalesbackend.payment.entity.PaymentMethod;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    @Query(value = "select nextval('payment_number_seq')", nativeQuery = true)
    Long nextPaymentNumber();

    @Query(value = """
            select distinct p from Payment p join p.customer c left join p.allocations pa left join pa.saleLot sl left join sl.lot l
            where (:method is null or p.paymentMethod = :method)
              and (:dateFrom is null or p.paymentDate >= :dateFrom)
              and (:dateTo is null or p.paymentDate <= :dateTo)
              and (:search = '' or cast(p.paymentNumber as string) like concat('%', :search, '%')
                or lower(c.fullName) like lower(concat('%', :search, '%'))
                or lower(c.phone) like lower(concat('%', :search, '%'))
                or lower(coalesce(l.code, '')) like lower(concat('%', :search, '%'))
                or lower(coalesce(sl.sale.folio, '')) like lower(concat('%', :search, '%')))
            """,
            countQuery = """
            select count(distinct p.id) from Payment p join p.customer c left join p.allocations pa left join pa.saleLot sl left join sl.lot l
            where (:method is null or p.paymentMethod = :method)
              and (:dateFrom is null or p.paymentDate >= :dateFrom)
              and (:dateTo is null or p.paymentDate <= :dateTo)
              and (:search = '' or cast(p.paymentNumber as string) like concat('%', :search, '%')
                or lower(c.fullName) like lower(concat('%', :search, '%'))
                or lower(c.phone) like lower(concat('%', :search, '%'))
                or lower(coalesce(l.code, '')) like lower(concat('%', :search, '%'))
                or lower(coalesce(sl.sale.folio, '')) like lower(concat('%', :search, '%')))
            """)
    Page<Payment> search(@Param("search") String search, @Param("method") PaymentMethod method, @Param("dateFrom") LocalDate dateFrom, @Param("dateTo") LocalDate dateTo, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "receivedBy", "allocations", "allocations.saleLot", "allocations.saleLot.sale", "allocations.saleLot.lot"})
    @Override
    Optional<Payment> findById(Long id);
}
