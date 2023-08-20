package com.glenneligio.dntx.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.glenneligio.dntx.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "transactions")
@JsonIgnoreProperties(value = {"creator"})
public class Transaction implements Serializable {

    @Id
    private String id;

    @NotBlank(message = "Transaction's username must not be blank")
    private String username;
    @DBRef
    @NotNull(message = "Transaction's creator must not be null")
    private Account creator;
    @PastOrPresent(message = "Transaction's date finished must be only present or past")
    private LocalDateTime dateFinished;
    private List<FileAttachment> fileAttachments;

    private TransactionType type;

    public void update(Transaction t) {
        this.username = t.getUsername();
        this.fileAttachments = t.getFileAttachments();
        this.dateFinished = t.getDateFinished();
    }
}
