package com.angelica.landsalesbackend.sale.exception;

import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;

public class SaleNotFoundException extends ResourceNotFoundException {
    public SaleNotFoundException() { super("Sale not found"); }
}
