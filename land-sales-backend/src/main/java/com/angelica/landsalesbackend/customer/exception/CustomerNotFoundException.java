package com.angelica.landsalesbackend.customer.exception;

import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;

public class CustomerNotFoundException extends ResourceNotFoundException {
    public CustomerNotFoundException() {
        super("Customer not found");
    }
}
