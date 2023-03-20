package com.glenneligio.dntx.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

    @NotBlank(message = "Username must not be blank")
    private String username;
    @NotBlank(message = "Password must not be blank")
    private String password;
    @Email(message = "Email must be a valid one")
    @NotBlank(message = "Email must not be blank")
    private String email;
    @NotBlank(message = "Full name must not be blank")
    private String fullName;
}
