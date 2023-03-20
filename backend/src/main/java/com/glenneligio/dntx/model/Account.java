package com.glenneligio.dntx.model;

import com.glenneligio.dntx.enums.AccountType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "accounts")
public class Account {

    @Id
    private String id;

    @Indexed(unique = true)
    @NotBlank(message = "Account username can't be blank")
    private String username;
    @NotBlank(message = "Account password can't be blank")
    private String password;
    @Email(message = "Account email must be a valid email")
    @NotBlank(message = "Account email must not be blank")
    private String email;
    private LocalDateTime dateRegistered;

    @NotBlank(message = "Account full name can't be blank")
    private String fullName;

    private AccountType accountType;

    public void update(Account updatedAccount) {
        this.password = updatedAccount.getPassword();
        this.email = updatedAccount.getEmail();
        this.username = updatedAccount.getUsername();
        this.fullName = updatedAccount.getFullName();
    }
}
