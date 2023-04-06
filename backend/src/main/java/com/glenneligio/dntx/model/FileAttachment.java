package com.glenneligio.dntx.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileAttachment {

    @NotBlank(message = "FileAttachment's fileName must not be blank")
    private String fileName;
    @NotBlank(message = "FileAttachment's fileUrl must not be blank")
    private String fileUrl;
}
