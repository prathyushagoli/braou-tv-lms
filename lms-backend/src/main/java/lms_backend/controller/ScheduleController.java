package lms_backend.controller;

import lms_backend.entity.Schedule;
import lms_backend.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Schedule> createSchedule(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) {

        Schedule schedule = new Schedule();
        schedule.setTitle(title);

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            schedule.setFileName(fileName);
            schedule.setFileType(file.getContentType());
            try {
                schedule.setFileData(file.getBytes());
            } catch (IOException ex) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

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
                schedule.setFileName(fileName);
                schedule.setFileType(file.getContentType());
                try {
                    schedule.setFileData(file.getBytes());
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
            scheduleRepository.delete(schedule);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional(readOnly = true)
    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<?> getFile(@PathVariable String fileName) {
        try {
            return scheduleRepository.findByFileName(fileName).map(schedule -> {
                if (schedule.getFileData() != null) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(
                                    schedule.getFileType() != null ? schedule.getFileType() : "application/pdf"))
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + schedule.getFileName() + "\"")
                            .body((Resource) new ByteArrayResource(schedule.getFileData()));
                } else {
                    return ResponseEntity.notFound().build();
                }
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.toString() + " - " + e.getMessage());
        }
    }
}
