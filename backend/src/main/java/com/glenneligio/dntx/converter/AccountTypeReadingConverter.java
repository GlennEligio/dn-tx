package com.glenneligio.dntx.converter;

import com.glenneligio.dntx.enums.AccountType;
import com.glenneligio.dntx.enums.TransactionType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
@Slf4j
public class AccountTypeReadingConverter implements Converter<String, AccountType> {

    @Override
    public AccountType convert(String code) {
        log.info("Inside AccountTypeReadingConverter");
        return AccountType.getAccountType(code);
    }
}
