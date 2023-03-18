package com.glenneligio.dntx.model;

import com.glenneligio.dntx.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "accounts")
public class Account {
    private String id;
    private String username;
    private String password;
    private String email;
    private LocalDateTime dateRegistered;
    private String fullName;

    private AccountType accountType;

    public void update(Account updatedAccount) {
        this.password = updatedAccount.getPassword();
        this.email = updatedAccount.getEmail();
        this.username = updatedAccount.getUsername();
        this.fullName = updatedAccount.getFullName();
    }
}
