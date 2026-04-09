package lms_backend.controller;

import lms_backend.entity.Programme;
import lms_backend.repository.ProgrammeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programmes")
public class ProgrammeController {

    @Autowired
    private ProgrammeRepository programmeRepository;

    @GetMapping
    public List<Programme> getAllProgrammes() {
        return programmeRepository.findAll();
    }

    @PostMapping
    public Programme createProgramme(@RequestBody Programme programme) {
        return programmeRepository.save(programme);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Programme> updateProgramme(@PathVariable Long id, @RequestBody Programme updatedProgramme) {
        return programmeRepository.findById(id)
                .map(programme -> {
                    programme.setTitle(updatedProgramme.getTitle());
                    programme.setUrl(updatedProgramme.getUrl());
                    programme.setType(updatedProgramme.getType());
                    return ResponseEntity.ok(programmeRepository.save(programme));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgramme(@PathVariable Long id) {
        return programmeRepository.findById(id)
                .map(programme -> {
                    programmeRepository.delete(programme);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
