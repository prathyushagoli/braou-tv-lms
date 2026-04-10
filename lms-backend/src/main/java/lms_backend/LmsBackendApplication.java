package lms_backend;

import lms_backend.entity.AdminUser;
import lms_backend.repository.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class LmsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(LmsBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initDatabase(AdminUserRepository adminUserRepository) {
		return args -> {
			// 1. Purge any legacy accounts dynamically correctly smartly safely natively implicitly
			adminUserRepository.findAll().forEach(user -> {
				if (!user.getEmail().equals("braoutv@braou.ac.in")) {
					adminUserRepository.delete(user);
					System.out.println("Purged legacy admin account properly: " + user.getEmail());
				}
			});

			// 2. Safely seed the correct explicit Admin Account
			if (adminUserRepository.findByEmail("braoutv@braou.ac.in").isEmpty()) {
				AdminUser admin = new AdminUser();
				admin.setEmail("braoutv@braou.ac.in");
				admin.setPassword(new BCryptPasswordEncoder().encode("Braou@234"));
				adminUserRepository.save(admin);
				System.out.println("Braou TV Admin User structurally seeded successfully.");
			}
		};
	}
}
