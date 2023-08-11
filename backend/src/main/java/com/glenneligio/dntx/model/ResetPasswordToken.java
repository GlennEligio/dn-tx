package com.glenneligio.dntx.model;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "reset-password-tokens")
@CompoundIndexes({
        @CompoundIndex(name = "accountId_token", def = "{'accountId': 1, 'token': 1}")
})
public class ResetPasswordToken {
    @Id
    private String id;
    @NotBlank(message = "Username can't be blank")
    private String accountId;
    @NotBlank(message = "Token can't be blank")
    private String token;
    @Future(message = "Token expiration date must be future")
    private LocalDateTime tokenExpirationDate;
    @Version
    private Long version;
}
