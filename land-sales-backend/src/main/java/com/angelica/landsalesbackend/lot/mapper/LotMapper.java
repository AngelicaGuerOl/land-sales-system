package com.angelica.landsalesbackend.lot.mapper;

import org.springframework.stereotype.Component;

@Component
public class LotMapper {

    public String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }
}
