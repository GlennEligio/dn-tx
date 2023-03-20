package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.model.Account;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAccountDto {

    @NotBlank(message = "Account password can't be blank")
    private String password;

    @Email(message = "Account email must be a valid email")
    @NotBlank(message = "Account email must not be blank")
    private String email;

    @NotBlank(message = "Account full name can't be blank")
    private String fullName;

    public Account toAccount() {
        Account account = new Account();
        account.setEmail(email);
        account.setPassword(password);
        return account;
    }
}
