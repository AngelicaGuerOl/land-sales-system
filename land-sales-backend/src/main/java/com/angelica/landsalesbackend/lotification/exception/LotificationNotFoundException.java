package com.angelica.landsalesbackend.lotification.exception;

import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;

public class LotificationNotFoundException extends ResourceNotFoundException {

    public LotificationNotFoundException() {
        super("Lotification not found");
    }
}
