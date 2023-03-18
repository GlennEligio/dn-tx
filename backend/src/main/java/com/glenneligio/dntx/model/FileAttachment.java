package com.glenneligio.dntx.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileAttachment {
    private String fileName;
    private String fileUrl;
}
