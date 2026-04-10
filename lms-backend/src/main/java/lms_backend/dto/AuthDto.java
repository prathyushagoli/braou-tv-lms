package lms_backend.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
    }

    @Data
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String otp; // Only for demonstration

        public AuthResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public AuthResponse(boolean success, String message, String otp) {
            this.success = success;
            this.message = message;
            this.otp = otp;
        }
    }
}
