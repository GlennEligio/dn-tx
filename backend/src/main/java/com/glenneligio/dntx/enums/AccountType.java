package com.glenneligio.dntx.enums;


import java.util.stream.Stream;

public enum AccountType {
    USER("USER"),
    ADMIN("ADMIN");

    private final String type;

    AccountType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public static AccountType getAccountType(String typeString) {
        return Stream.of(AccountType.values())
                .filter(type -> typeString.equals(type.getType()))
                .findFirst()
                .orElseThrow(IllegalArgumentException::new);
    }
}
