package com.angelica.landsalesbackend.lotification.repository;

import com.angelica.landsalesbackend.lotification.entity.Lotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LotificationRepository extends JpaRepository<Lotification, Long> {

    List<Lotification> findAllByOrderByNameAsc();
}
