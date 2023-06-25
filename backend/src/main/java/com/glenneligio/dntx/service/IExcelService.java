package com.glenneligio.dntx.service;
import com.glenneligio.dntx.model.Transaction;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Set;

public interface IExcelService<T> {
    ByteArrayInputStream listToExcel(List<T> objects);

    Set<T> excelToList(MultipartFile file);
}
