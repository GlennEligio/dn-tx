package com.glenneligio.dntx.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionResponse {
    private List<String> errors;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy KK:mm:ss a")
    private LocalDateTime timestamp;
    private String details;
}