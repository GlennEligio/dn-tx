package com.glenneligio.dntx.handlers;

import com.glenneligio.dntx.dtos.ExceptionResponse;
import com.glenneligio.dntx.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class DnTxExceptionHandler extends ResponseEntityExceptionHandler {

    // General Exception handler
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ExceptionResponse> handleAllException (Exception ex, WebRequest request){
        ExceptionResponse response = new ExceptionResponse(ex.getMessage(),
                LocalDateTime.now(),
                request.getDescription(false));
        ex.printStackTrace();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ApiException handler
    @ExceptionHandler(value = ApiException.class)
    public ResponseEntity<ExceptionResponse> handleApiException (Exception ex, WebRequest request){
        ApiException apiException = (ApiException) ex;
        ExceptionResponse response = new ExceptionResponse(ex.getMessage(),
                LocalDateTime.now(),
                request.getDescription(false));
        ex.printStackTrace();
        return new ResponseEntity<>(response, apiException.getStatus());
    }
}
