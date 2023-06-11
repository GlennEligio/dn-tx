package com.glenneligio.dntx.service;

import com.glenneligio.dntx.dtos.DnTxUserDetails;
import com.glenneligio.dntx.enums.AccountType;
import com.glenneligio.dntx.exception.ApiException;
import com.glenneligio.dntx.model.Account;
import com.glenneligio.dntx.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class AccountService implements UserDetailsService {

    private static final String CLASS_NAME = AccountService.class.getName();

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Account getAccountById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ApiException("No account with specified id was found", HttpStatus.NOT_FOUND));
    }

    public Account getAccountByUsername(String username) {
        final String METHOD_NAME = "getAccountByUsername";
        log.info("Calling {} inside {} with username {}", METHOD_NAME, CLASS_NAME, username);
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("No account with specified username was found", HttpStatus.NOT_FOUND));
    }

    public Account createAccount(Account account) {
        Optional<Account> existingAccount = accountRepository.findByUsername(account.getUsername());
        if(existingAccount.isPresent()) throw new ApiException("Account with same username", HttpStatus.BAD_REQUEST);
        return accountRepository.save(account);
    }

    public Account updateAccount(String username, Account account) {
        account.setUsername(username);
        Account accountToUpdate = getAccountByUsername(username);
        account.setPassword(bCryptPasswordEncoder.encode(account.getPassword()));
        accountToUpdate.update(account);
        return accountRepository.save(accountToUpdate);
    }

    public void deleteAccount(String username) {
        Account accountToDelete = getAccountByUsername(username);
        accountRepository.delete(accountToDelete);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No account with username " + username + " found"));
        return new DnTxUserDetails(account);
    }

    public Account login(String username, String password) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));
        // Check if the password in login and the encrypted password in database matches
        boolean match = bCryptPasswordEncoder.matches(password, account.getPassword());
        if(!match) throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        return account;
    }

    public Account register (Account account) {
        Optional<Account> existingAccount = accountRepository.findByUsername(account.getUsername());
        if(existingAccount.isPresent()) throw new ApiException("Account with same username already exist", HttpStatus.BAD_REQUEST);
        account.setPassword(bCryptPasswordEncoder.encode(account.getPassword()));
        account.setDateRegistered(LocalDateTime.now());
        account.setAccountType(AccountType.USER);
        return accountRepository.save(account);
    }
}
