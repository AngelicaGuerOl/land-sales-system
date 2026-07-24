package com.angelica.landsalesbackend.lot.exception;

import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;

public class LotNotFoundException extends ResourceNotFoundException {

    public LotNotFoundException() {
        super("Lot not found");
    }
}
