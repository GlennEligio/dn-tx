package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.model.Account;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateAccountDto {

    @NotBlank(message = "Account username can't be blank")
    private String username;

    @NotBlank(message = "Account password can't be blank")
    private String password;

    @Email(message = "Account email must be a valid email")
    @NotBlank(message = "Account email must not be blank")
    private String email;

    @PastOrPresent(message = "Date registered can only be present or past dates")
    @NotNull(message = "Date registered must be present")
    private LocalDateTime dateRegistered;

    @NotBlank(message = "Account full name can't be blank")
    private String fullName;

    @Pattern(regexp = "(USER|ADMIN)", message = "Account types can only be either USER or ADMIN")
    @NotBlank(message = "Account type must not be null")
    private String accountType;

    public Account toAccount() {
        Account account = new Account();
        account.setUsername(username);
        account.setEmail(email);
        account.setPassword(password);
        return account;
    }
}
