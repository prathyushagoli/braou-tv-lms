package lms_backend.controller;

import lms_backend.entity.Schedule;
import lms_backend.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    private final Path fileStorageLocation;

    public ScheduleController() {
        this.fileStorageLocation = Paths.get("uploads/schedules")
                .toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Schedule> createSchedule(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) {

        String fileName = null;
        if (file != null && !file.isEmpty()) {
            fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

        Schedule schedule = new Schedule(title, fileName);
        return ResponseEntity.ok(scheduleRepository.save(schedule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        return scheduleRepository.findById(id).map(schedule -> {
            if (title != null) {
                schedule.setTitle(title);
            }
            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                try {
                    Path targetLocation = this.fileStorageLocation.resolve(fileName);
                    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                    
                    // Optionally delete old file
                    if (schedule.getFileName() != null) {
                        Path oldFile = this.fileStorageLocation.resolve(schedule.getFileName());
                        Files.deleteIfExists(oldFile);
                    }
                    
                    schedule.setFileName(fileName);
                } catch (IOException ex) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(schedule); // Return 500
                }
            }
            return ResponseEntity.ok(scheduleRepository.save(schedule));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        return scheduleRepository.findById(id).map(schedule -> {
            if (schedule.getFileName() != null) {
                try {
                    Path target = this.fileStorageLocation.resolve(schedule.getFileName());
                    Files.deleteIfExists(target);
                } catch (IOException ex) {
                    // Log error but proceed to delete record
                }
            }
            scheduleRepository.delete(schedule);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
