package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.model.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

public class DnTxUserDetails implements UserDetails {

    private String username;
    private String password;
    private String fullName;
    private String[] types;

    public DnTxUserDetails(Account account) {
        username = account.getUsername();
        password = account.getPassword();
        fullName = account.getFullName();
        types = new String[] {account.getAccountType().getType()};
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.stream(types).map(SimpleGrantedAuthority::new).toList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getFullName() {
        return fullName;
    }
}
