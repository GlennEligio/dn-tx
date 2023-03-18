package com.glenneligio.dntx.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {
    private String username;
    private String password;
    private String email;
    private String fullName;
}
