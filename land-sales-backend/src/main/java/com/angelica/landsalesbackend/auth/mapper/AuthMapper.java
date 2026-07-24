package com.angelica.landsalesbackend.auth.mapper;

import com.angelica.landsalesbackend.auth.dto.CurrentUserResponse;
import com.angelica.landsalesbackend.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public CurrentUserResponse toCurrentUserResponse(User user) {
        return new CurrentUserResponse(user.getId(), user.getUsername(), user.getFullName());
    }
}
