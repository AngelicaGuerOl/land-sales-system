package com.angelica.landsalesbackend.customer.repository;

import com.angelica.landsalesbackend.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("""
            select c from Customer c
            where (:active is null or c.active = :active)
              and (:search = ''
                   or lower(c.fullName) like lower(concat('%', :search, '%'))
                   or lower(c.phone) like lower(concat('%', :search, '%'))
                   or lower(coalesce(c.alternatePhone, '')) like lower(concat('%', :search, '%')))
            """)
    Page<Customer> search(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);
}
