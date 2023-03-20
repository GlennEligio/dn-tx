package com.glenneligio.dntx.enums;

import lombok.extern.slf4j.Slf4j;

import java.util.stream.Stream;

@Slf4j
public enum TransactionType {
    CcToGold("CC2GOLD"),
    GoldToPhp("GOLD2PHP");

    private final String code;

    TransactionType(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public static TransactionType getTransactionType(String codeString) {
        log.info("Converting {} into Transaction type", codeString);
        return Stream.of(TransactionType.values())
                .filter(code -> codeString.equals(code.getCode()))
                .findFirst()
                .orElse(null);
    }
}