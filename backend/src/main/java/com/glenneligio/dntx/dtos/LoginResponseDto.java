package com.glenneligio.dntx.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponseDto {
    private String username;
    private String accessToken;
    private String refreshToken;
    private String fullName;
    private String accountType;
}
