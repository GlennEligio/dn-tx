package com.glenneligio.dntx.controller;

import com.glenneligio.dntx.dtos.DnTxUserDetails;
import com.glenneligio.dntx.dtos.LoginRequestDto;
import com.glenneligio.dntx.dtos.LoginResponseDto;
import com.glenneligio.dntx.dtos.RegisterRequestDto;
import com.glenneligio.dntx.enums.AccountType;
import com.glenneligio.dntx.model.Account;
import com.glenneligio.dntx.model.Transaction;
import com.glenneligio.dntx.service.AccountService;
import com.glenneligio.dntx.service.TransactionService;
import com.glenneligio.dntx.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@Slf4j
public class AccountController {

    @Autowired
    private AccountService accountService;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{username}")
    public ResponseEntity<Account> getAccountByUsername(@PathVariable String username) {
        final String METHOD_NAME = "getAccountByUsername";
        log.info("Calling {} with username {}", METHOD_NAME, username);
        return ResponseEntity.ok(accountService.getAccountByUsername(username));
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        Account accountCreated = accountService.createAccount(account);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{username}")
                        .buildAndExpand(accountCreated.getUsername())
                        .toUri())
                .body(accountCreated);
    }

    @PutMapping("/{username}")
    public ResponseEntity<Account> updateAccount(@PathVariable String username,
                                                 @RequestBody Account account) {
        return ResponseEntity.ok(accountService.updateAccount(username, account));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteAccount(@PathVariable String username) {
        accountService.deleteAccount(username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto dto) {
        var account = accountService.login(dto.getUsername(), dto.getPassword());
        LoginResponseDto loginResponseDto = getLoginResponseDto(account);
        return ResponseEntity.ok(loginResponseDto);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> register(@RequestBody RegisterRequestDto dto) {
        Account account = new Account();
        account.setFullName(dto.getFullName());
        account.setUsername(dto.getUsername());
        account.setEmail(dto.getEmail());
        account.setPassword(dto.getPassword());
        Account registeredAccount = accountService.register(account);
        LoginResponseDto loginResponseDto = getLoginResponseDto(registeredAccount);
        return ResponseEntity.ok(loginResponseDto);
    }

    @GetMapping("/@self/transactions")
    public ResponseEntity<List<Transaction>> getAccountTransactions(Authentication authentication) {
        log.info("Fetching own transactions with principal {}", authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        return ResponseEntity.ok(transactionService.getTransactionsByCreatorUsername(username));
    }

    @GetMapping("/@self")
    public ResponseEntity<Account> getOwnAccount(Authentication authentication) {
        log.info("Fetching own account details with principal {}", authentication.getPrincipal());
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        return ResponseEntity.ok(accountService.getAccountByUsername(username));
    }

    @PutMapping("/@self")
    public ResponseEntity<Account> updateOwnAccount(Authentication authentication,
                                                    @RequestBody Account account) {
        log.info("Updating own account using principal {}", authentication.getPrincipal());
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        account.setUsername(username);
        Account updatedAccount = accountService.updateAccount(username, account);
        return ResponseEntity.ok(updatedAccount);
    }


    private LoginResponseDto getLoginResponseDto(Account account) {
        var dnTxUserDetails = new DnTxUserDetails(account);
        var accessToken = jwtUtil.generateToken(dnTxUserDetails);
        var refreshToken = jwtUtil.generateRefreshToken(dnTxUserDetails);
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accountType(account.getAccountType().getType())
                .fullName(account.getFullName())
                .username(account.getUsername())
                .build();
    }

}
