package com.angelica.landsalesbackend.shared.exception;

import com.angelica.landsalesbackend.lot.exception.LotConflictException;
import com.angelica.landsalesbackend.lot.exception.LotValidationException;
import com.angelica.landsalesbackend.block.exception.BlockConflictException;
import com.angelica.landsalesbackend.block.exception.BulkLotConflictException;
import com.angelica.landsalesbackend.sale.exception.SaleConflictException;
import com.angelica.landsalesbackend.sale.exception.SaleValidationException;
import com.angelica.landsalesbackend.payment.exception.PaymentConflictException;
import com.angelica.landsalesbackend.payment.exception.PaymentValidationException;
import com.angelica.landsalesbackend.report.exception.ReportValidationException;
import jakarta.validation.ConstraintViolationException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ApiErrorResponse> notFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    @ExceptionHandler({
            UnauthorizedException.class,
            AuthenticationException.class,
            AuthenticationCredentialsNotFoundException.class
    })
    ResponseEntity<ApiErrorResponse> unauthorized(Exception ex, HttpServletRequest request) {
        return error(HttpStatus.UNAUTHORIZED, "Unauthorized", request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return error(HttpStatus.BAD_REQUEST, "Validation failed", request, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiErrorResponse> constraintValidation(ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation -> errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        return error(HttpStatus.BAD_REQUEST, "Validation failed", request, errors);
    }

    @ExceptionHandler({LotValidationException.class, SaleValidationException.class, PaymentValidationException.class, ReportValidationException.class})
    ResponseEntity<ApiErrorResponse> businessValidation(Exception ex, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    @ExceptionHandler({
            LotConflictException.class,
            BlockConflictException.class,
            BulkLotConflictException.class,
            SaleConflictException.class,
            PaymentConflictException.class,
            DataIntegrityViolationException.class,
            OptimisticLockingFailureException.class
    })
    ResponseEntity<ApiErrorResponse> conflict(Exception ex, HttpServletRequest request) {
        String message = ex instanceof LotConflictException || ex instanceof BlockConflictException || ex instanceof BulkLotConflictException || ex instanceof SaleConflictException || ex instanceof PaymentConflictException
                ? ex.getMessage()
                : "The lot was changed by another request or conflicts with existing data";
        Map<String, String> details = ex instanceof BulkLotConflictException bulk
                ? Map.of("conflicts", String.join(", ", bulk.getConflicts()))
                : null;
        return error(HttpStatus.CONFLICT, message, request, details);
    }

    private ResponseEntity<ApiErrorResponse> error(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> validationErrors
    ) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                OffsetDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                validationErrors
        ));
    }
}
