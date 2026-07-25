package com.angelica.landsalesbackend.accountstatement.repository;

import com.angelica.landsalesbackend.accountstatement.dto.AccountStatementSummaryResponse;
import com.angelica.landsalesbackend.customer.entity.Customer;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountStatementRepository extends JpaRepository<Customer, Long> {
    @Query(value = """
            select new com.angelica.landsalesbackend.accountstatement.dto.AccountStatementSummaryResponse(
                c.id, c.fullName, c.phone, count(distinct sl.id),
                coalesce(sum(sl.agreedPrice), 0), coalesce(sum(sl.downPayment), 0),
                coalesce(sum(sl.financedAmount - sl.outstandingBalance), 0), coalesce(sum(sl.outstandingBalance), 0))
            from Sale s join s.customer c join s.saleLots sl
            where (:search = '' or lower(c.fullName) like lower(concat('%', :search, '%'))
                or lower(c.phone) like lower(concat('%', :search, '%'))
                or lower(coalesce(c.alternatePhone, '')) like lower(concat('%', :search, '%')))
            group by c.id, c.fullName, c.phone
            """,
            countQuery = """
            select count(c.id) from Customer c
            where exists (select 1 from Sale s where s.customer = c)
              and (:search = '' or lower(c.fullName) like lower(concat('%', :search, '%'))
                or lower(c.phone) like lower(concat('%', :search, '%'))
                or lower(coalesce(c.alternatePhone, '')) like lower(concat('%', :search, '%')))
            """)
    Page<AccountStatementSummaryResponse> search(@Param("search") String search, Pageable pageable);
}
