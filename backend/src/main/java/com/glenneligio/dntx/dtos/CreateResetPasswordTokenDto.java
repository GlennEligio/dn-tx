package com.glenneligio.dntx.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateResetPasswordTokenDto {
    @NotBlank(message = "Email can't be blank")
    @Email(message = "Email must be a valid one")
    private String email;

}
