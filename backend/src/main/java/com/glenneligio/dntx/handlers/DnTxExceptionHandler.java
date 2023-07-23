package com.glenneligio.dntx.handlers;

import com.glenneligio.dntx.dtos.ExceptionResponse;
import com.glenneligio.dntx.exception.ApiException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
@Slf4j
public class DnTxExceptionHandler extends ResponseEntityExceptionHandler {

    // General Exception handler
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ExceptionResponse> handleAllException (Exception ex, WebRequest request){
        ExceptionResponse response = new ExceptionResponse(List.of(ex.getMessage()),
                LocalDateTime.now(),
                request.getDescription(false));
        ex.printStackTrace();
        // added for more exception info
        ex.getCause();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ApiException handler
    @ExceptionHandler(value = ApiException.class)
    public ResponseEntity<ExceptionResponse> handleApiException (Exception ex, WebRequest request){
        ApiException apiException = (ApiException) ex;
        ExceptionResponse response = new ExceptionResponse(List.of(ex.getMessage()),
                LocalDateTime.now(),
                request.getDescription(false));
        ex.printStackTrace();
        // added for more exception info
        ex.getCause();
        return new ResponseEntity<>(response, apiException.getStatus());
    }

    // Handle validation errors, mostly in RequestBody
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<String> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }
        for (ObjectError error : ex.getBindingResult().getGlobalErrors()) {
            errors.add(error.getObjectName() + ": " + error.getDefaultMessage());
        }
        ExceptionResponse response = new ExceptionResponse(errors,
                LocalDateTime.now(),
                request.getDescription(false));
        ex.printStackTrace();
        // added for more exception info
        ex.getCause();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    private ResponseEntity<ExceptionResponse> onConstraintValidationException(ConstraintViolationException e,
                                                                              WebRequest request) {
        ExceptionResponse error = new ExceptionResponse();
        var errors = new ArrayList<String>();
        for (ConstraintViolation violation : e.getConstraintViolations()) {
            errors.add(violation.getPropertyPath() + ": " + violation.getMessage());
        }
        error.setDetails(request.getDescription(false));
        error.setErrors(errors);
        error.setTimestamp(LocalDateTime.now());
        return ResponseEntity.status(400).body(error);
    }
}
