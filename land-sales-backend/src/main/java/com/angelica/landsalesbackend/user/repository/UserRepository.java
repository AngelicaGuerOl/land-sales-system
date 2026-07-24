package com.angelica.landsalesbackend.user.repository;

import com.angelica.landsalesbackend.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByActiveTrue();
}
