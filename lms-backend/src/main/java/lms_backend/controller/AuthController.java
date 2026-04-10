package lms_backend.controller;

import lms_backend.dto.AuthDto.*;
import lms_backend.entity.AdminUser;
import lms_backend.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private JavaMailSender mailSender;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            AdminUser user = userOpt.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.ok(new AuthResponse(true, "Login Successful"));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, "Invalid credentials"));
    }

    private void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("braoutv@braou.ac.in");
            message.setTo(toEmail);
            message.setSubject("LMS Admin Reset Password OTP");
            message.setText("Your OTP for resetting the Admin Password is: " + otp
                    + "\n\nThis OTP is valid for exactly 15 minutes. Please do not share this code with anyone.");
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send OTP Email: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            AdminUser user = userOpt.get();

            // Generate 6 digit OTP securely correctly
            String otp = String.format("%06d", new Random().nextInt(999999));
            user.setResetToken(otp);
            user.setTokenExpiry(LocalDateTime.now().plusMinutes(15));
            adminUserRepository.save(user);

            // Dispatch Email directly securely via Spring Boot Mailer!
            sendOtpEmail(user.getEmail(), otp);

            return ResponseEntity.ok(new AuthResponse(true, "OTP sent to your email", otp));
        }
        return ResponseEntity.ok(new AuthResponse(true, "If this email exists, an OTP has been dispatched"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            AdminUser user = userOpt.get();
            if (user.getResetToken() != null && user.getResetToken().equals(request.getOtp())) {
                if (user.getTokenExpiry() != null && LocalDateTime.now().isBefore(user.getTokenExpiry())) {
                    // Token is valid natively
                    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                    user.setResetToken(null);
                    user.setTokenExpiry(null);
                    adminUserRepository.save(user);
                    return ResponseEntity.ok(new AuthResponse(true, "Password has been successfully changed"));
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new AuthResponse(false, "OTP has expired"));
                }
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(false, "Invalid OTP"));
    }
}
