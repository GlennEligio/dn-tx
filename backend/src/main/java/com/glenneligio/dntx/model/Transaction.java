package com.glenneligio.dntx.model;

import com.glenneligio.dntx.enums.TransactionType;
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
public class Transaction implements Serializable {

    @Id
    private String id;
    private String username;
    @DBRef
    private Account creator;
    private LocalDateTime dateFinished;
    private List<FileAttachment> fileAttachments;

    private TransactionType type;

    public void update(Transaction t) {
        this.username = t.getUsername();
        this.fileAttachments = t.getFileAttachments();
    }
}
