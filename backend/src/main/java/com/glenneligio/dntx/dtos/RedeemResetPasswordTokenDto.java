package com.glenneligio.dntx.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RedeemResetPasswordTokenDto {
    @NotBlank(message = "New password can't be blank")
    private String newPassword;
    @NotBlank(message = "Reset password token can't be blank")
    private String token;
}
