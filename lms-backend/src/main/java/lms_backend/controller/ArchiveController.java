package lms_backend.controller;

import lms_backend.entity.Archive;
import lms_backend.repository.ArchiveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archives")
public class ArchiveController {

    @Autowired
    private ArchiveRepository archiveRepository;

    @GetMapping
    public List<Archive> getAllArchives() {
        return archiveRepository.findAll();
    }

    @PostMapping
    public Archive createArchive(@RequestBody Archive archive) {
        return archiveRepository.save(archive);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Archive> updateArchive(@PathVariable Long id, @RequestBody Archive updatedArchive) {
        return archiveRepository.findById(id)
                .map(archive -> {
                    archive.setTitle(updatedArchive.getTitle());
                    archive.setUrl(updatedArchive.getUrl());
                    return ResponseEntity.ok(archiveRepository.save(archive));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteArchive(@PathVariable Long id) {
        return archiveRepository.findById(id)
                .map(archive -> {
                    archiveRepository.delete(archive);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
