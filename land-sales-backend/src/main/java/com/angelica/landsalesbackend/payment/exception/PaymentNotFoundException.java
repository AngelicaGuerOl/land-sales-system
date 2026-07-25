package com.angelica.landsalesbackend.payment.exception;

import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;

public class PaymentNotFoundException extends ResourceNotFoundException {
    public PaymentNotFoundException() { super("Payment not found"); }
}
