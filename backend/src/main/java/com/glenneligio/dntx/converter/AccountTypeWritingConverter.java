package com.glenneligio.dntx.converter;

import com.glenneligio.dntx.enums.AccountType;
import com.glenneligio.dntx.enums.TransactionType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
@Slf4j
public class AccountTypeWritingConverter implements Converter<AccountType, String> {
    @Override
    public String convert(AccountType type) {
        log.info("Inside AccountTypeWritingConverter");
        return type.getType();
    }
}
